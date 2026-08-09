-- 006_create_cart.sql
-- One cart per user. restaurant_id is set on first item added and enforces
-- the "one restaurant per order" rule at the DB layer via the app logic
-- (a cart_items row always maps to a meal in cart.restaurant_id's menu).
CREATE TABLE carts (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id   INTEGER REFERENCES restaurants(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
    id              SERIAL PRIMARY KEY,
    cart_id         INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    meal_id         INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, meal_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
