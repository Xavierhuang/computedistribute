# computedistribute

A marketplace for spare GPU compute, starting as a **batch-job service**: buyers submit
jobs through an API, and host machines running the worker agent claim and run them.
See `reports/Spare compute marketplace research.md` for the market research behind this.

## What's here

- **Job API and queue** (`src/`): Express plus Postgres. Workers claim jobs atomically
  (`FOR UPDATE SKIP LOCKED`) and hold a lease, which they extend by heartbeating. A reaper
  requeues jobs whose worker went quiet, and fails them once `max_attempts` is used up.
  Every claim issues a new `lease_id`, so a slow or stale worker can't overwrite a job
  that has since been reassigned or canceled.
- **Worker agent** (`agent/agent.js`): registers a machine, polls for work, heartbeats
  and reports results. It runs handlers in-process, which is **not** isolation: jobs must
  run in a VM or sandbox before untrusted hosts or buyer-supplied code are allowed.
- **Job types** (`src/jobTypes.js`): only `echo` for now. Real workloads (transcription,
  embeddings, image generation, LLM batch) get added here and in the agent's `handlers`.

## Run locally

Requires Node 22.9+ and Postgres 16.

```sh
# One-time: a project-local Postgres on port 54329 (data in .pgdata/, gitignored)
export LC_ALL=en_US.UTF-8
initdb -D .pgdata -U postgres --auth=trust -E UTF8
pg_ctl -D .pgdata -o "-p 54329 -k /tmp" -l .pgdata/server.log -w start
createdb -h /tmp -p 54329 -U postgres computedistribute
createdb -h /tmp -p 54329 -U postgres computedistribute_test

cp .env.example .env
npm install
npm test                                         # integration tests (uses the _test database)
npm run dev                                      # API on :3000, applies migrations on start

npm run create-account -- buyer "Acme"           # prints a buyer API key once
npm run create-account -- host "My rig"          # prints a host API key once
CD_HOST_KEY=<host key> CD_VRAM_GB=24 npm run agent
```

Submit a job:

```sh
curl -X POST localhost:3000/v1/jobs -H "authorization: Bearer <buyer key>" \
  -H 'content-type: application/json' -d '{"type":"echo","input":{"hello":"world"}}'
```

## API

All requests need `Authorization: Bearer <api key>`. Buyer and host keys can't be used for each other's endpoints.

| Who | Method & path | Purpose |
|---|---|---|
| buyer | `POST /v1/jobs` | Submit `{type, input, min_vram_gb?, priority?, max_attempts?}`. An optional `Idempotency-Key` header returns the original job on retry. |
| buyer | `GET /v1/jobs?status=&limit=` | List your jobs |
| buyer | `GET /v1/jobs/:id` | Job status, output, error |
| buyer | `POST /v1/jobs/:id/cancel` | Cancel a queued or running job |
| host | `POST /v1/host/workers` | Register a machine `{name, job_types, vram_gb, capabilities?}` |
| host | `POST /v1/host/workers/:id/claim` | Get the next matching job and a lease (`204` if none) |
| host | `POST /v1/host/leases/:leaseId/heartbeat` | Extend the lease |
| host | `POST /v1/host/leases/:leaseId/complete` | Report `{output}` |
| host | `POST /v1/host/leases/:leaseId/fail` | Report `{error, retryable}` |

Lease endpoints return `409 lease_lost` when the job was canceled, reassigned or already finished. The worker should then drop the job.

## Not built yet

Credits and billing, host payouts (Stripe Connect), real job types, sandboxed execution,
spot-check verification and reputation, and a web dashboard.

## License

MIT License - 2026
