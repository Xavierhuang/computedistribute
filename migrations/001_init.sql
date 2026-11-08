-- Core marketplace tables: accounts, API keys, host workers, and the job queue.

CREATE TABLE accounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('buyer', 'host')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Only a SHA-256 hash of each key is stored; the plaintext is shown once at creation.
CREATE TABLE api_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  key_hash    text NOT NULL UNIQUE,
  key_prefix  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz
);

-- A machine run by a host account. It only receives job types it declares.
CREATE TABLE workers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name          text NOT NULL,
  job_types     text[] NOT NULL,
  vram_gb       numeric NOT NULL DEFAULT 0 CHECK (vram_gb >= 0),
  capabilities  jsonb NOT NULL DEFAULT '{}',
  last_seen_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- A buyer's job. While running, it holds a lease: lease_id fences out stale
-- workers (a new id is issued on every claim), lease_expires_at lets the reaper
-- requeue work from workers that disappeared.
CREATE TABLE jobs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id          uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type              text NOT NULL,
  input             jsonb NOT NULL,
  min_vram_gb       numeric NOT NULL DEFAULT 0 CHECK (min_vram_gb >= 0),
  priority          int NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'queued'
                      CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'canceled')),
  attempts          int NOT NULL DEFAULT 0,
  max_attempts      int NOT NULL DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 10),
  idempotency_key   text,
  worker_id         uuid REFERENCES workers(id) ON DELETE SET NULL,
  lease_id          uuid,
  lease_expires_at  timestamptz,
  output            jsonb,
  error             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  started_at        timestamptz,
  finished_at       timestamptz,
  UNIQUE (buyer_id, idempotency_key)
);

CREATE INDEX jobs_queue_idx  ON jobs (priority DESC, created_at) WHERE status = 'queued';
CREATE INDEX jobs_lease_idx  ON jobs (lease_expires_at) WHERE status = 'running';
CREATE INDEX jobs_buyer_idx  ON jobs (buyer_id, created_at DESC);
CREATE UNIQUE INDEX jobs_lease_id_idx ON jobs (lease_id) WHERE lease_id IS NOT NULL;
