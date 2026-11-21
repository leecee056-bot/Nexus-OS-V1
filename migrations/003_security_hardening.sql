-- Unique email when present (optional contact); empty/null emails allowed.
ALTER TABLE accounts ALTER COLUMN email DROP NOT NULL;

UPDATE accounts SET email = NULL WHERE email IS NULL OR btrim(email) = '';

-- Keep the oldest row when duplicates already exist.
UPDATE accounts a
SET email = NULL
WHERE a.email IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM accounts b
    WHERE b.email IS NOT NULL
      AND lower(b.email) = lower(a.email)
      AND b.id < a.id
  );

CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_unique_idx
  ON accounts (lower(email))
  WHERE email IS NOT NULL;

-- Shared rate-limit counters (works across instances when DATABASE_URL is set).
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key TEXT PRIMARY KEY,
  hit_count INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limits_reset_idx ON rate_limits (reset_at);
