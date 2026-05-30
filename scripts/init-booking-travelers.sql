-- Tipos de identificación, datos extendidos del cliente y acompañantes

CREATE TABLE IF NOT EXISTS catalog_id_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO catalog_id_types (code, name, sort_order)
VALUES
  ('CC', 'Cédula de ciudadanía', 1),
  ('CE', 'Cédula de extranjería', 2),
  ('PA', 'Pasaporte', 3),
  ('TI', 'Tarjeta de identidad', 4)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_id_type_id UUID REFERENCES catalog_id_types(id),
  ADD COLUMN IF NOT EXISTS customer_id_number VARCHAR(64),
  ADD COLUMN IF NOT EXISTS customer_city VARCHAR(120),
  ADD COLUMN IF NOT EXISTS customer_phone_e164 VARCHAR(32),
  ADD COLUMN IF NOT EXISTS booking_source VARCHAR(32) NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS customer_attended_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS booking_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  id_type_id UUID REFERENCES catalog_id_types(id),
  id_number VARCHAR(64),
  is_child BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_guests_booking_id ON booking_guests(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_attended ON bookings(customer_attended_at) WHERE customer_attended_at IS NOT NULL;
