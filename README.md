# computedistribute

**A marketplace for spare GPU compute.** Buyers submit speech-to-text jobs. Anyone with an
idle GPU runs our worker agent and earns 70% of every job their machine completes.
Built for the hackathon's **distributed compute track**.

- **Live:** https://computedistribute-7e117eb4.apps.lingcode.app
- **Demo video:** a 2-minute narrated walkthrough, recorded from the real system. It is not
  in git; generate it with `node scripts/record-demo.js` (see [Demo video](#demo-video)).
- **Market research:** `reports/Spare compute marketplace research.md`.

## Try it in 2 minutes

1. Open the live site and create a **buyer** account. Demo mode gives you $5 of free credit.
2. Check the **Live network** card. Jobs only run while at least one machine is online
   (see [Run a worker](#run-locally) to add your own).
3. Paste a public audio URL, choose **3 machines in parallel**, and click **Transcribe**.
   This one is 4 min 16 s of clear speech:
   `https://upload.wikimedia.org/wikipedia/commons/0/01/President_Ronald_Reagan%27s_Address_to_the_Nation_on_the_Explosion_of_The_Space_Shuttle_Challenger_from_the_Oval_Office_-_DPLA_-_0f2ec85660d45e2ed94bb8dc3579d2e4.mp3`
4. Open **Chunks by machine** to watch each chunk run on a different machine, then
   **Merged transcript** to see the result stitched back together.
5. Kill one worker mid-job (Ctrl-C twice in its terminal). About 15 s later its chunk moves
   to another machine and the job still completes, at no extra cost to the buyer.

## The distributed-compute ideas

| Problem | How it's solved | Where |
|---|---|---|
| Many machines asking for work at once | Each job is claimed atomically with `SELECT … FOR UPDATE SKIP LOCKED`; it is never handed to two machines at once. Tested with 25 concurrent claims for 10 jobs. | `src/queue.js` `claim` |
| Splitting one big job | The dashboard reads the audio's length and submits one chunk job per time range (`clip_start_s`/`clip_end_s` plus a shared `group`). The scheduler fans chunks out to different machines, and the dashboard merges them in time order. | `public/app.js`, `src/jobTypes.js` |
| Machines crashing or going silent | A claim is a **lease** (15 s in the demo) that the worker renews by heartbeating. A reaper requeues expired leases, so another machine retries the job, up to `max_attempts`. Every claim gets a new `lease_id`, so a slow or stale worker can't overwrite the newer result. | `src/queue.js`, `agent/agent.js` |
| Untrusted machines lying about results | 5% of jobs are re-run on a **different owner's** machine and compared. A mismatch refunds the buyer and claws back the host's pay; repeat offenders are suspended. | `src/verify.js` |
| Untrusted buyers attacking hosts | Workers fetch buyer URLs through a guard that refuses private and internal addresses after DNS resolution and on every redirect. | `agent/net.js` |
| Paying many parties correctly | Every money movement is written in the same database transaction as the job's state change, in an append-only ledger. Each job is charged and released exactly once. | `src/ledger.js` |

**Honest limits:**
- **Speedup needs separate computers.** One Whisper process already uses every CPU core,
  so three workers on one laptop are no faster than one. Measured on an M4: 47.0 s
  whole versus 47.7 s split three ways. The speedup across separate machines hasn't been
  measured yet.
- **Chunk boundaries can cut a word,** because chunks are split at fixed times rather
  than at pauses in speech.
- **Each worker downloads the whole file,** not just its chunk.

## How the marketplace works

- **Accounts:** people sign up on the dashboard (`/`) as a **buyer** or a **host**, then
  create API keys there. Sessions use an HttpOnly cookie, and passwords are hashed with scrypt.
  Accounts can be deleted from the dashboard.
- **Money** (`src/ledger.js`, `src/pricing.js`) is an append-only ledger in micro-dollars:
  - Submitting a job places a **hold** for its maximum cost (4 hours of audio).
  - When the job succeeds, the hold is released and the buyer is **charged** for the
    actual audio length, billed per second.
  - The host **earns 70%** of that charge.
  - Failed, canceled and timed-out jobs release the hold and cost nothing.
  - Every movement happens in the same transaction as the job's state change, and is
    idempotent per job.
- **Prices** (`GET /v1/pricing`), per audio minute:

  | Model | Price |
  |---|---|
  | `tiny` | $0.001 |
  | `base` | $0.0015 |
  | `small` | $0.002 |
  | `medium` | $0.003 |
  | `large-v3` | $0.004 |
- **Adding credit:** buyers pay by card through Stripe Checkout, which credits the account
  from a signed webhook (once per session). Admins can also grant credit directly.
- **Payouts:** a host requests a payout of at least $10, which moves the amount out of
  their balance. An admin sends the money (PayPal or Wise, by hand for now) and marks the
  payout paid, or rejects it, which returns the money.
- **Verification** (`src/verify.js`): `VERIFY_RATE` of successful jobs (5% by default) are
  re-run on a *different host's* machine, and the two transcripts are compared.
  - A mismatch refunds the buyer and claws back the original host's earning.
  - A host is suspended after 3 or more failed checks, if they make up more than 25% of its checks.
  - The platform pays for re-runs, which costs about 3.5% of revenue at a 5% sample rate.
- **Admin** (`/v1/admin`, `Authorization: Bearer $ADMIN_TOKEN`) covers stats, accounts,
  credit grants, suspensions and payouts.

## Components

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
    Input `{audio_url, model?, language?, task?, clip_start_s?, clip_end_s?, group?}`. Models are `tiny`, `base`, `small` (the default),
    `medium` and `large-v3`, and the model sets the default `min_vram_gb` (1–10 GB).
    `task: "translate"` outputs English. Output `{text, language, language_probability, duration_s, model, segments[]}`.
    With a clip range, only that part of the file is transcribed and billed, and the funds held cover just the clip.
    Chunk jobs that share a `group` are shown and merged together on the dashboard.
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
| anyone | `GET /v1/pricing` | Price list |
| anyone | `GET /v1/network` | Live view: machines seen in the last 45 s, plus jobs queued, running and recently done |
| buyer | `POST /v1/me/demo-credit` | Demo mode only: add `DEMO_CREDIT_USD` of free credit (up to 4× that balance) |
| anyone | `POST /v1/auth/signup` · `/login` · `/logout` | Dashboard sessions `{email, password, kind}` |
| any account | `GET /v1/me` · `GET /v1/me/ledger` | Profile and balance; ledger history |
| any account | `GET/POST /v1/me/api-keys`, `DELETE /v1/me/api-keys/:id` | Manage API keys |
| any account | `DELETE /v1/me` | Delete the account `{password}` (session only) |
| buyer | `POST /v1/me/topups` | `{amount_usd: 5–1000}` → Stripe Checkout URL |
| host | `GET /v1/me/workers` · `GET/POST /v1/me/payouts` | Machines with stats; payout requests `{amount_usd, destination}` |
| Stripe | `POST /v1/stripe/webhook` | Signed `checkout.session.completed` events credit the buyer |
| admin | `/v1/admin/stats`, `/accounts`, `/grants`, `/accounts/:id/suspend`, `/unsuspend`, `/payouts`, `/payouts/:id/paid`, `/payouts/:id/reject` | Operations |

The dashboard uses the same endpoints with a session cookie instead of an API key.
Cookie-authenticated `POST`s must be JSON, which blocks cross-site form posts (CSRF).
A job submitted without enough credit returns `402 insufficient_funds`.

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
- **App settings:** hosted apps receive the backend's vault secrets as environment
  variables. Set them with the Cloud `set_backend_secret` tool (not `set_app_secret`,
  which is for Worker apps), then redeploy. Current production values:
  - `PUBLIC_URL`: the https app URL.
  - `TRUST_PROXY=1`.
  - `ADMIN_TOKEN`.
  - Hackathon demo settings: `DEMO_CREDIT_USD=5`, `LEASE_SECONDS=15` and
    `REAPER_INTERVAL_MS=3000`, so failover shows up within seconds.
  - Stripe is **not** connected for the hackathon. Setting `STRIPE_SECRET_KEY` and
    `STRIPE_WEBHOOK_SECRET` would enable card top-ups.
- **Turning on card top-ups:**
  1. In Stripe, add a webhook endpoint at `<PUBLIC_URL>/v1/stripe/webhook` for
     `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
  2. Set both Stripe secrets and redeploy.
- **Accounts** are self-serve through the dashboard. `scripts/create-account.js` is for
  local development only.

## Demo video

`node scripts/record-demo.js` writes `demo-video/computedistribute-demo.mp4`, a narrated
2-minute walkthrough. It does this by:
1. starting a local server and three worker agents;
2. driving the real dashboard in headless Chromium through a 3-way split and a mid-job crash;
3. narrating each caption with macOS text-to-speech (`DEMO_VOICE`, default "Ava (Premium)");
4. mixing the narration in with ffmpeg.

It needs:
- the local Postgres on :54329;
- the Whisper venv;
- Playwright and Chromium in `~/.local/share/computedistribute/videotools`:
  `npm install playwright-core && npx playwright-core install chromium`;
- `imageio-ffmpeg` installed in the venv.

## Not built yet

- **Automatic host payouts** through Stripe Connect. Payouts are sent by hand for now.
- **Password reset and email verification.** Both need outbound email.
- **File uploads.** Buyers pass a public audio URL instead.
- **More job types:** embeddings, image generation, LLM batch.
- **Sandboxing.** Not needed while every job type runs fixed code; it would be needed
  before accepting buyer-supplied code.

## License

MIT License - 2026
