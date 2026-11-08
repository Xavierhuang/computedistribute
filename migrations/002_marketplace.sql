-- Self-serve accounts, money, payouts and work verification.

ALTER TABLE accounts ADD COLUMN suspended_at timestamptz;
ALTER TABLE accounts ADD COLUMN suspended_reason text;
-- The platform's own buyer account that submits verification jobs.
ALTER TABLE accounts ADD COLUMN is_system boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX accounts_system_idx ON accounts (is_system) WHERE is_system;

-- Dashboard logins. One user per account; the account's kind fixes the role.
CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id     uuid NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  email          text NOT NULL,
  password_hash  text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_idx ON users (lower(email));

-- Only a SHA-256 hash of the session token is stored.
CREATE TABLE sessions (
  token_hash  text PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);
CREATE INDEX sessions_user_idx ON sessions (user_id);

ALTER TABLE api_keys ADD COLUMN name text;
ALTER TABLE api_keys ADD COLUMN last_used_at timestamptz;

-- Append-only money ledger in micro-dollars (1 USD = 1,000,000). An account's
-- balance is the sum of its entries; holds are negative entries released later.
CREATE TABLE ledger_entries (
  id             bigserial PRIMARY KEY,
  account_id     uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount_micros  bigint NOT NULL,
  kind           text NOT NULL CHECK (kind IN (
                   'topup', 'grant', 'hold', 'release', 'charge', 'earning',
                   'refund', 'clawback', 'payout', 'payout_reversal')),
  job_id         uuid REFERENCES jobs(id) ON DELETE SET NULL,
  ref            text,
  memo           text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ledger_account_idx ON ledger_entries (account_id, created_at DESC);
-- Makes Stripe webhooks, settlements and payouts idempotent.
CREATE UNIQUE INDEX ledger_kind_ref_idx ON ledger_entries (kind, ref) WHERE ref IS NOT NULL;

ALTER TABLE jobs ADD COLUMN hold_micros bigint NOT NULL DEFAULT 0;
ALTER TABLE jobs ADD COLUMN cost_micros bigint;
ALTER TABLE jobs ADD COLUMN host_earning_micros bigint;
ALTER TABLE jobs ADD COLUMN host_account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;
-- A verification job re-runs another job on a different host.
ALTER TABLE jobs ADD COLUMN verifies_job_id uuid REFERENCES jobs(id) ON DELETE CASCADE;
CREATE INDEX jobs_verifies_idx ON jobs (verifies_job_id) WHERE verifies_job_id IS NOT NULL;

CREATE TABLE verifications (
  job_id          uuid PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
  verify_job_id   uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  host_account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  similarity      numeric NOT NULL,
  passed          boolean NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX verifications_host_idx ON verifications (host_account_id);

CREATE TABLE payout_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount_micros   bigint NOT NULL CHECK (amount_micros > 0),
  destination     text NOT NULL,
  status          text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'paid', 'rejected')),
  admin_note      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  resolved_at     timestamptz
);
CREATE INDEX payout_requests_status_idx ON payout_requests (status, created_at);
