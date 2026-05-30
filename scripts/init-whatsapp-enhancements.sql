-- Reintentos WhatsApp y confirmación de disfrute del pasadía

ALTER TABLE whatsapp_settings
  ADD COLUMN IF NOT EXISTS max_send_attempts INTEGER NOT NULL DEFAULT 3
    CHECK (max_send_attempts >= 1 AND max_send_attempts <= 10);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS experience_completed_at TIMESTAMPTZ;

ALTER TABLE whatsapp_message_log
  ADD COLUMN IF NOT EXISTS send_attempts INTEGER NOT NULL DEFAULT 0;

UPDATE whatsapp_message_log
SET send_attempts = 1
WHERE status = 'sent' AND send_attempts = 0;
