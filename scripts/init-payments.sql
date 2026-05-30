-- Abonos / pagos parciales por reserva

CREATE TABLE IF NOT EXISTS booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'COP',
  payment_method VARCHAR(40) NOT NULL,
  reference VARCHAR(120),
  voucher_url TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_payments_booking_id ON booking_payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_paid_at ON booking_payments (paid_at DESC);
