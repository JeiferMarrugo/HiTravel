import type { WhatsAppTemplateKey } from "@/lib/whatsapp/types";

export const WHATSAPP_TEMPLATE_OPTIONS: Array<{
  key: WhatsAppTemplateKey;
  label: string;
  description: string;
}> = [
  {
    key: "website_booking_received",
    label: "Solicitud recibida (web)",
    description: "Al reservar desde la página pública; gestión por WhatsApp.",
  },
  {
    key: "contact_form_client_reply",
    label: "Confirmación formulario contacto",
    description: "Respuesta automática al cliente en la página Contáctanos.",
  },
  {
    key: "booking_confirmed",
    label: "Reserva confirmada",
    description: "Confirma la reserva al cliente.",
  },
  {
    key: "checkin_reminder",
    label: "Recordatorio de check-in",
    description: "Recuerda fecha y hora de salida.",
  },
  {
    key: "post_experience_review",
    label: "Invitación a dejar reseña",
    description: "Enlace único para calificar el pasadía.",
  },
];

export function whatsappTemplateLabel(key: WhatsAppTemplateKey): string {
  return WHATSAPP_TEMPLATE_OPTIONS.find((item) => item.key === key)?.label ?? key;
}
