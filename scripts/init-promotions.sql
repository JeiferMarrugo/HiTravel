-- Promociones configurables (descuentos, niño gratis, etc.)

CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  description TEXT,
  promotion_type VARCHAR(40) NOT NULL
    CHECK (promotion_type IN (
      'percent_discount',
      'fixed_discount',
      'free_child',
      'second_passenger_discount',
      'group_discount',
      'early_booking'
    )),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  tour_ids UUID[] DEFAULT NULL,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions (promotion_type);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS discount_cents INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bookings_promotion_id ON bookings (promotion_id);

-- Varias promociones por reserva
CREATE TABLE IF NOT EXISTS booking_promotions (
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL,
  promotion_name VARCHAR(120) NOT NULL,
  discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (booking_id, promotion_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_promotions_booking ON booking_promotions (booking_id);

INSERT INTO booking_promotions (booking_id, promotion_id, promotion_name, discount_cents, sort_order)
SELECT b.id, b.promotion_id, pr.name, GREATEST(b.discount_cents, 0), 0
FROM bookings b
INNER JOIN promotions pr ON pr.id = b.promotion_id
WHERE b.promotion_id IS NOT NULL
ON CONFLICT (booking_id, promotion_id) DO NOTHING;
