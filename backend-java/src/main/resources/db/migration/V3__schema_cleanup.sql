-- Clean up duplicate user_oauth records before adding unique constraint
DELETE FROM user_oauth a USING (
    SELECT MIN(id) as id, provider, provider_user_id
    FROM user_oauth
    GROUP BY provider, provider_user_id
    HAVING COUNT(*) > 1
) b
WHERE a.provider = b.provider
  AND a.provider_user_id = b.provider_user_id
  AND a.id != b.id;

-- Add unique constraint on (provider, provider_user_id)
ALTER TABLE user_oauth ADD CONSTRAINT uq_user_oauth_provider UNIQUE (provider, provider_user_id);

-- Add NOT NULL constraint to users.email
UPDATE users SET email = '' WHERE email IS NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Add missing indexes on foreign key columns
CREATE INDEX IF NOT EXISTS ix_game_accounts_user_id ON game_accounts(user_id);
CREATE INDEX IF NOT EXISTS ix_user_oauth_user_id ON user_oauth(user_id);
CREATE INDEX IF NOT EXISTS ix_wishes_account_id ON wishes(account_id);
