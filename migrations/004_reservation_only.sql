-- Username reservations without collecting Network passwords for a vapourware
-- chat service. Existing password accounts keep working for sign-in.
ALTER TABLE accounts ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS reservation_only BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE accounts
SET reservation_only = FALSE
WHERE reservation_only IS NULL;
