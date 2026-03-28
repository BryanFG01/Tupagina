-- ============================================================
-- TuNegocio — Script SQL inicial para PostgreSQL
-- Alternativa a EF Core Migrations para crear el esquema
-- desde cero en una BD existente.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Para gen_random_uuid() si se necesita

-- ── Tabla: users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email             TEXT NOT NULL UNIQUE,
    password_hash     TEXT NOT NULL,
    name              TEXT NOT NULL,
    role              TEXT NOT NULL DEFAULT 'user',
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: landings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS landings (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    slug         TEXT NOT NULL UNIQUE,
    description  TEXT,
    blocks       JSONB,
    published    BOOLEAN NOT NULL DEFAULT FALSE,
    theme_config JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landings_user_id ON landings(user_id);
CREATE INDEX IF NOT EXISTS idx_landings_slug    ON landings(slug);

-- ── Tabla: products ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    landing_id  TEXT NOT NULL REFERENCES landings(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL,
    stock       INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    image_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_landing_id ON products(landing_id);

-- ── Tabla: orders ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id                       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    landing_id               TEXT NOT NULL REFERENCES landings(id) ON DELETE RESTRICT,
    customer_email           TEXT NOT NULL,
    customer_name            TEXT NOT NULL,
    total_amount             NUMERIC(10,2) NOT NULL,
    status                   TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed | cancelled
    stripe_session_id        TEXT,
    stripe_payment_intent_id TEXT,
    client_reference         TEXT NOT NULL UNIQUE, -- "order_{guid}"
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_client_reference ON orders(client_reference);
CREATE INDEX IF NOT EXISTS idx_orders_landing_id       ON orders(landing_id);

-- ── Tabla: order_items ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_id              TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id            TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity              INTEGER NOT NULL,
    unit_price_snapshot   NUMERIC(10,2) NOT NULL, -- Precio al momento de la compra
    product_name_snapshot TEXT NOT NULL            -- Nombre al momento de la compra
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
