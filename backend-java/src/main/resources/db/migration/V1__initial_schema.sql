CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);

CREATE TABLE IF NOT EXISTS user_oauth (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    provider VARCHAR(255),
    provider_user_id VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS ix_user_oauth_id ON user_oauth(id);

CREATE TABLE IF NOT EXISTS game_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    game_id VARCHAR(255),
    uid VARCHAR(255),
    server VARCHAR(255),
    name VARCHAR(255),
    ar INTEGER DEFAULT 1,
    wl VARCHAR(255) DEFAULT '0',
    mc_option VARCHAR(255) DEFAULT ''
);

CREATE INDEX IF NOT EXISTS ix_game_accounts_id ON game_accounts(id);
CREATE INDEX IF NOT EXISTS ix_game_accounts_game_id ON game_accounts(game_id);
CREATE INDEX IF NOT EXISTS ix_game_accounts_uid ON game_accounts(uid);

CREATE TABLE IF NOT EXISTS wishes (
    id SERIAL PRIMARY KEY,
    wish_uid VARCHAR(255) UNIQUE,
    account_id INTEGER REFERENCES game_accounts(id),
    gacha_type INTEGER,
    item_id VARCHAR(255),
    item_name VARCHAR(255),
    rarity INTEGER,
    timestamp TIMESTAMP,
    banner_id VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS ix_wishes_id ON wishes(id);
CREATE INDEX IF NOT EXISTS ix_wishes_wish_uid ON wishes(wish_uid);
