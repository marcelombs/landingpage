-- ======================================================================
-- NUDO Landing Page — Esquema de datos (PostgreSQL 14+)
-- T-004 — Ejecutar como dueño de la BD:
--   psql -U nudo_app -d nudo_landing -f database/schema.sql
-- ======================================================================

BEGIN;

-- ----------------------------------------------------------------------
-- Tabla: products (catálogo público)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name              VARCHAR(120)  NOT NULL,
    slug              VARCHAR(140)  UNIQUE,
    category          VARCHAR(40)   NOT NULL,
    short_description TEXT,
    price             NUMERIC(10,2) NOT NULL CHECK (price > 0),
    currency          CHAR(3)       NOT NULL DEFAULT 'BOB'
                    CHECK (currency ~ '^[A-Z]{3}$'),
    image_url         VARCHAR(500),
    is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
    sort_order        INTEGER       NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE products IS 'Catálogo público de prendas tejidas';
COMMENT ON COLUMN products.is_active IS 'Solo los productos activos se exponen en GET /api/products';
COMMENT ON COLUMN products.price IS 'Precio en la moneda indicada por currency; el servidor es la única fuente de precio';

CREATE INDEX IF NOT EXISTS idx_products_category_active
    ON products (category) WHERE is_active;

-- ----------------------------------------------------------------------
-- Tabla: contact_messages (consultas del formulario)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    email      VARCHAR(255),
    phone      VARCHAR(40),
    subject    VARCHAR(200) NOT NULL,
    message    TEXT         NOT NULL,
    product_id BIGINT REFERENCES products (id) ON DELETE SET NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'new'
             CHECK (status IN ('new', 'reviewed', 'closed')),
    ip_hash    CHAR(64),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    -- RF-05: al menos un medio de contacto válido (correo o teléfono)
    CONSTRAINT chk_contact_at_least_one_method
        CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

COMMENT ON TABLE contact_messages IS 'Consultas enviadas desde el formulario de contacto';
COMMENT ON COLUMN contact_messages.ip_hash IS 'SHA-256 de la IP; solo para limitación de frecuencia. Nunca se guarda la IP en claro';
COMMENT ON COLUMN contact_messages.product_id IS 'Producto consultado (opcional); ON DELETE SET NULL conserva el histórico';

CREATE INDEX IF NOT EXISTS idx_contact_ip_hash_created
    ON contact_messages (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status
    ON contact_messages (status);

-- ----------------------------------------------------------------------
-- updated_at: PostgreSQL no actualiza el campo automáticamente
-- (spec.md §9) → disparador genérico reutilizable
-- ----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMIT;
