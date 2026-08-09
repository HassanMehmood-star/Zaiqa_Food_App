-- 005_create_blocked_users.sql
CREATE TABLE restaurant_blocked_users (
    id              SERIAL PRIMARY KEY,
    restaurant_id   INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (restaurant_id, user_id)
);

CREATE INDEX idx_blocked_restaurant ON restaurant_blocked_users(restaurant_id);
CREATE INDEX idx_blocked_user ON restaurant_blocked_users(user_id);
