-- Reseñas de pasajeros vinculadas a reservas

CREATE TABLE IF NOT EXISTS tour_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  booking_code VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS idx_tour_reviews_tour_published
  ON tour_reviews (tour_id, created_at DESC)
  WHERE is_published = TRUE;

CREATE TABLE IF NOT EXISTS booking_review_tokens (
  booking_id UUID PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_review_tokens_token ON booking_review_tokens (token);

ALTER TABLE whatsapp_settings
  ADD COLUMN IF NOT EXISTS send_after_experience BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE whatsapp_settings
  ADD COLUMN IF NOT EXISTS hours_after_checkin INTEGER NOT NULL DEFAULT 12
    CHECK (hours_after_checkin >= 1 AND hours_after_checkin <= 168);
