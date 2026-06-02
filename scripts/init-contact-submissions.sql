-- Solicitudes del formulario de contacto (web pública)

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_e164 VARCHAR(32) NOT NULL,
  message TEXT NOT NULL,
  client_whatsapp_sent BOOLEAN NOT NULL DEFAULT FALSE,
  admin_whatsapp_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions (created_at DESC);

INSERT INTO whatsapp_message_templates (template_key, name, description, body)
VALUES (
  'contact_form_client_reply',
  'Confirmación formulario de contacto',
  'Respuesta automática al cliente que escribe desde la página Contáctanos.',
  'Hola {{customer_name}},

¡Gracias por contactar a *HI TRAVEL*! Recibimos tu mensaje y muy pronto uno de nuestros asesores te atenderá de forma personalizada.

*Resumen de tu solicitud*
📧 Correo: {{email}}
📱 Teléfono: {{phone}}

💬 *Lo que nos contaste:*
«{{message}}»

Si deseas agilizar tu cotización, responde a este chat con la fecha tentativa de viaje y cuántas personas viajarían.

Estamos listos para ayudarte a vivir experiencias inolvidables en el Caribe colombiano.

Con cariño,
*Equipo HI TRAVEL* 🌊'
)
ON CONFLICT (template_key) DO NOTHING;
