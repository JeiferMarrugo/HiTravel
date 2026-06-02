import {
  createContactSubmission,
  markContactSubmissionWhatsAppStatus,
} from "@/lib/contact/contact-submissions";
import { getConfiguredTargetPhone, normalizePhoneNumber, sendTextMessage } from "@/lib/openwa";
import { query } from "@/lib/db";
import { renderMessageTemplate } from "@/lib/whatsapp/render-template";
import type { WhatsAppTemplateKey } from "@/lib/whatsapp/types";

export type ContactFormInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactFormResult = {
  submissionId: string | null;
  clientWhatsAppSent: boolean;
  adminWhatsAppSent: boolean;
  userMessage: string;
};

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName.trim();
}

async function getTemplateBody(templateKey: WhatsAppTemplateKey) {
  const rows = await query<{ body: string; is_enabled: boolean }>(
    "SELECT body, is_enabled FROM whatsapp_message_templates WHERE template_key = $1",
    [templateKey],
  );
  const row = rows[0];
  if (!row?.is_enabled) {
    return null;
  }
  return row.body;
}

function defaultClientReply(variables: Record<string, string>) {
  return renderMessageTemplate(
    `Hola {{customer_name}},

¡Gracias por contactar a *HI TRAVEL*! Recibimos tu mensaje y muy pronto uno de nuestros asesores te atenderá de forma personalizada.

*Resumen de tu solicitud*
📧 Correo: {{email}}
📱 Teléfono: {{phone}}

💬 *Lo que nos contaste:*
«{{message}}»

Si deseas agilizar tu cotización, responde a este chat con la fecha tentativa de viaje y cuántas personas viajarían.

Estamos listos para ayudarte a vivir experiencias inolvidables en el Caribe colombiano.

Con cariño,
*Equipo HI TRAVEL* 🌊`,
    variables,
  );
}

function formatAdminNotification(input: ContactFormInput, phoneE164: string) {
  return [
    "🔔 *Nuevo contacto web — HI TRAVEL*",
    "",
    `👤 *Nombre:* ${input.name}`,
    `📧 *Correo:* ${input.email}`,
    `📱 *WhatsApp:* ${phoneE164}`,
    "",
    "💬 *Mensaje del cliente:*",
    input.message,
    "",
    "✅ Se envió confirmación automática al cliente.",
    "Responde desde aquí para continuar la conversación.",
  ].join("\n");
}

async function buildClientReply(input: ContactFormInput, phoneE164: string) {
  const variables = {
    customer_name: firstName(input.name),
    full_name: input.name,
    email: input.email,
    phone: phoneE164,
    message: input.message,
  };

  const templateBody = await getTemplateBody("contact_form_client_reply");
  if (templateBody) {
    return renderMessageTemplate(templateBody, variables);
  }

  return defaultClientReply(variables);
}

export async function processContactFormSubmission(input: ContactFormInput): Promise<ContactFormResult> {
  const phoneE164 = normalizePhoneNumber(input.phone);

  const submissionId = await createContactSubmission({
    fullName: input.name,
    email: input.email,
    phoneE164,
    message: input.message,
  });

  const clientReply = await buildClientReply(input, phoneE164);
  const adminNotification = formatAdminNotification(input, phoneE164);

  let clientWhatsAppSent = false;
  let adminWhatsAppSent = false;

  try {
    await sendTextMessage({ phoneNumber: phoneE164, text: clientReply });
    clientWhatsAppSent = true;
  } catch {
    clientWhatsAppSent = false;
  }

  try {
    await sendTextMessage({
      phoneNumber: getConfiguredTargetPhone(),
      text: adminNotification,
    });
    adminWhatsAppSent = true;
  } catch {
    adminWhatsAppSent = false;
  }

  if (submissionId) {
    await markContactSubmissionWhatsAppStatus(submissionId, {
      clientSent: clientWhatsAppSent,
      adminSent: adminWhatsAppSent,
    });
  }

  let userMessage =
    "Recibimos tu mensaje. Nuestro equipo te contactará muy pronto por correo o WhatsApp.";

  if (clientWhatsAppSent) {
    userMessage =
      "¡Gracias por escribirnos! Te enviamos un WhatsApp con el resumen de tu solicitud. Muy pronto un asesor te atenderá.";
  }

  return {
    submissionId,
    clientWhatsAppSent,
    adminWhatsAppSent,
    userMessage,
  };
}
