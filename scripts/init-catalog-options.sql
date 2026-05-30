-- Monedas, países y categorías configurables (admin → Configuración)

CREATE TABLE IF NOT EXISTS catalog_currencies (
  code VARCHAR(3) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  cop_exchange_rate INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE catalog_currencies
  ADD COLUMN IF NOT EXISTS cop_exchange_rate INTEGER;

UPDATE catalog_currencies
SET cop_exchange_rate = 4200
WHERE code = 'USD' AND cop_exchange_rate IS NULL;

CREATE TABLE IF NOT EXISTS catalog_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_countries_sort ON catalog_countries (sort_order, name);

INSERT INTO catalog_currencies (code, name, sort_order) VALUES
  ('COP', 'Peso colombiano', 10),
  ('USD', 'Dólar estadounidense', 20)
ON CONFLICT (code) DO NOTHING;

INSERT INTO catalog_countries (name, sort_order) VALUES
  ('Colombia', 10),
  ('México', 20),
  ('Perú', 30),
  ('Ecuador', 40),
  ('Panamá', 50)
ON CONFLICT (name) DO NOTHING;
