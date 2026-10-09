-- ======================================================================
-- NUDO Landing Page — Datos iniciales de DEMOSTRACIÓN (T-005)
-- Precios, nombres e imágenes derivados del diseño de referencia;
-- aprobados como contenido académico en T-002 (2026-10-09).
-- Ejecutar después de schema.sql:
--   psql -U nudo_app -d nudo_landing -f database/seed.sql
-- ======================================================================

BEGIN;

-- Limpieza idempotente para poder re-ejecutar el seed
TRUNCATE TABLE contact_messages RESTART IDENTITY CASCADE;
TRUNCATE TABLE products RESTART IDENTITY CASCADE;

INSERT INTO products (name, slug, category, short_description, price, currency, image_url, is_active, sort_order)
VALUES
    ('Chompa Siena',   'chompa-siena',   'chompas',
     'Chompa tejida de corte cruzado, ideal para el frío del altiplano.',
     119.00, 'BOB', '/assets/images/3.avif',  TRUE,  1),
    ('Bicle Nube',     'bicle-nube',     'bicles',
     'Bicolores a manga corta con vivos verde y rojo.',
     89.00,  'BOB', '/assets/images/4.avif',  TRUE,  2),
    ('Chompa Terracota','chompa-terracota','chompas',
     'Tejido grueso color vino, punto de canalé.',
     139.00, 'BOB', '/assets/images/5.avif',  TRUE,  3),
    ('Bicle Linea',    'bicle-linea',    'bicles',
     'Bicolores de punto liviano, manga larga.',
     95.00,  'BOB', '/assets/images/6.avif',  TRUE,  4),
    ('Chompa Paramo',  'chompa-paramo',  'chompas',
     'Chompa oversized con textura natural.',
     139.00, 'BOB', '/assets/images/7.avif',  TRUE,  5),
    ('Bicle Moka',     'bicle-moka',     'bicles',
     'Bicolores cuello alto, tejido moka.',
     99.00,  'BOB', '/assets/images/8.avif',  TRUE,  6),

    -- Producto inactivo: no debe aparecer en el catálogo público
    ('Chompa Muestra Inactiva', 'chompa-muestra-inactiva', 'chompas',
     'Producto desactivado para probar el filtro is_active.',
     999.00, 'BOB', NULL, FALSE, 99);

COMMIT;

-- Verificación rápida (T-005):
-- SELECT id, name, category, price, is_active FROM products ORDER BY sort_order;
