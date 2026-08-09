-- 004_create_orders.sql
CREATE TYPE order_status AS ENUM (
    'Placed', 'Processing', 'In Route', 'Delivered', 'Received', 'Canceled'
);

CREATE TABLE orders (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id   INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
    total_amount    NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    status          order_status NOT NULL DEFAULT 'Placed',
    delivery_name   VARCHAR(150),
    delivery_phone  VARCHAR(30),
    delivery_address TEXT,
    order_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id                  SERIAL PRIMARY KEY,
    order_id            INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    meal_id             INTEGER REFERENCES meals(id) ON DELETE SET NULL,
    meal_name_snapshot  VARCHAR(150) NOT NULL,
    price_snapshot      NUMERIC(10,2) NOT NULL CHECK (price_snapshot >= 0),
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    subtotal            NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE order_status_history (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status          order_status NOT NULL,
    changed_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    changed_by_role user_role,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_history_order ON order_status_history(order_id);
