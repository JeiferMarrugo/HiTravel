-- Reservas, plantillas WhatsApp y registro de envíos

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(20) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  customer_email VARCHAR(255),
  tour_name VARCHAR(255) NOT NULL,
  checkin_at TIMESTAMPTZ NOT NULL,
  amount_cents INTEGER,
  currency VARCHAR(3) NOT NULL DEFAULT 'COP',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_checkin_at ON bookings (checkin_at);
CREATE INDEX IF NOT EXISTS idx_bookings_approval_status ON bookings (approval_status);

CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active_session_id VARCHAR(64),
  send_on_booking_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  send_before_checkin BOOLEAN NOT NULL DEFAULT TRUE,
  hours_before_checkin INTEGER NOT NULL DEFAULT 24
    CHECK (hours_before_checkin >= 1 AND hours_before_checkin <= 168),
  default_country_code VARCHAR(5) NOT NULL DEFAULT '57',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO whatsapp_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
  template_key VARCHAR(50) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  body TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  template_key VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  message_body TEXT NOT NULL,
  openwa_session_id VARCHAR(64),
  status VARCHAR(20) NOT NULL DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id, template_key)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_message_log_sent_at ON whatsapp_message_log (sent_at DESC);
