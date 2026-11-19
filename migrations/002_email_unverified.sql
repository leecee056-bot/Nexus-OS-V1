-- Email is contact-only until a future verification flow.
-- Username remains the unique Network reservation key.
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_email_key;

CREATE INDEX IF NOT EXISTS accounts_email_lookup_idx ON accounts (email);
