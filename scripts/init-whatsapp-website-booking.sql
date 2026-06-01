-- Mensaje automático al crear reserva desde la web pública

ALTER TABLE whatsapp_settings
  ADD COLUMN IF NOT EXISTS send_on_website_booking BOOLEAN NOT NULL DEFAULT TRUE;

INSERT INTO whatsapp_message_templates (template_key, name, description, body)
VALUES (
  'website_booking_received',
  'Solicitud recibida (web)',
  'Se envía al confirmar una solicitud de reserva desde la página pública (sin necesidad de aprobar la reserva antes).',
  'Hola {{customer_name}}, recibimos tu solicitud de reserva *{{booking_code}}* para *{{tour_name}}* el {{checkin_date}}.

El resto de tu reserva (confirmación, pagos y detalles) la gestionaremos contigo por este medio de WhatsApp.

Código de referencia: {{booking_code}}
Total estimado: {{amount}}

— HI TRAVEL'
)
ON CONFLICT (template_key) DO NOTHING;
