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
- **Worker agent** (`agent/agent.js`): registers a machine (or syncs a reused one's job
  types on start), polls for work, heartbeats, and reports results. Handlers run on the
  host without a sandbox. That's acceptable for the fixed job types below, but buyer-supplied
  code would need a VM or sandbox first.
- **Job types** (`src/jobTypes.js` validates them; `agent/handlers/` runs them):
  - `echo`: returns its input. Useful for testing the loop.
  - `transcribe`: Whisper speech-to-text via `faster-whisper` (CUDA if available, else CPU).
    Input `{audio_url, model?, language?, task?}`. Models are `tiny`, `base`, `small` (the default),
    `medium` and `large-v3`, and the model sets the default `min_vram_gb` (1–10 GB).
    `task: "translate"` outputs English. Output `{text, language, language_probability, duration_s, model, segments[]}`.
- **Buyer URLs are fetched safely** (`agent/net.js`): the agent refuses private, loopback
  and link-local addresses *after* DNS resolution and on every redirect, so a buyer
  can't make a host probe its own network. Downloads are capped (`CD_MAX_DOWNLOAD_MB`,
  default 500). 4xx and blocked URLs fail immediately; transient errors are retried.

## Run locally

Requires Node 22.9+ and Postgres 16.

```sh
# One-time: a local Postgres on port 54329. Keep its data OUTSIDE the project:
# the Cloud deploy uploads this folder (max 500 files).
export LC_ALL=en_US.UTF-8
PGDATA_DIR="$HOME/.local/share/computedistribute/pgdata"
initdb -D "$PGDATA_DIR" -U postgres --auth=trust -E UTF8
pg_ctl -D "$PGDATA_DIR" -o "-p 54329 -k /tmp" -l "$PGDATA_DIR/server.log" -w start
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

To let the agent run `transcribe` jobs, give it a Python with `faster-whisper`. Keep the
virtualenv outside the repo:

```sh
VENV="$HOME/.local/share/computedistribute/venv"
uv venv --python 3.12 "$VENV" && uv pip install --python "$VENV/bin/python" -r agent/requirements.txt
CD_PYTHON="$VENV/bin/python" CD_HOST_KEY=<host key> CD_VRAM_GB=16 npm run agent
```

The first job for each model downloads its weights from Hugging Face (75 MB for `tiny`, about 3 GB for `large-v3`).

Submit jobs:

```sh
curl -X POST localhost:3000/v1/jobs -H "authorization: Bearer <buyer key>" \
  -H 'content-type: application/json' -d '{"type":"echo","input":{"hello":"world"}}'

curl -X POST localhost:3000/v1/jobs -H "authorization: Bearer <buyer key>" \
  -H 'content-type: application/json' \
  -d '{"type":"transcribe","input":{"audio_url":"https://github.com/openai/whisper/raw/main/tests/jfk.flac","model":"tiny"}}'
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
| host | `PUT /v1/host/workers/:id` | Replace a worker's name, job types, VRAM and capabilities |
| host | `POST /v1/host/workers/:id/claim` | Get the next matching job and a lease (`204` if none) |
| host | `POST /v1/host/leases/:leaseId/heartbeat` | Extend the lease |
| host | `POST /v1/host/leases/:leaseId/complete` | Report `{output}` |
| host | `POST /v1/host/leases/:leaseId/fail` | Report `{error, retryable}` |

Lease endpoints return `409 lease_lost` when the job was canceled, reassigned or already finished. The worker should then drop the job.

## Deployment (LingCode Cloud)

Live at https://computedistribute-7e117eb4.apps.lingcode.app as a hosted Node 22 app
(`Procfile`) on backend `4e7bcfd36af1bad36f010c43`. It reads `DATABASE_URL`, which the
platform injects.

- **Migrations:** the app's database role cannot run DDL. Apply each new
  `migrations/*.sql` file with the Cloud migration tool, together with
  `INSERT INTO schema_migrations (name) VALUES ('<file>')`, *before* redeploying.
  On boot the app sees nothing pending and runs no DDL.
- **RLS** is enabled on every table with no policies, so the public anon key can't read
  `api_keys` or `jobs`. The app's own role still has access. Keep it that way.
- **Accounts:** `scripts/create-account.js` needs direct database access, which isn't
  available from outside. On Cloud, insert the account and the SHA-256 hash of a new
  key through the migration tool. (An admin endpoint would replace this.)

## Not built yet

Credits and billing, host payouts (Stripe Connect), more job types (embeddings, image
generation, LLM batch), sandboxed execution, spot-check verification and reputation,
self-serve signup, and a web dashboard.

## License

MIT License - 2026
