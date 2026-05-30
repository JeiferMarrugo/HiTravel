import { getBookingById } from "@/lib/catalog/bookings";
import { ensureReviewToken, listBookingsDueForReviewRequest } from "@/lib/catalog/tour-reviews";
import { formatMoneyDisplay } from "@/lib/catalog/money";
import { query } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";
import { normalizePhoneNumber, runMessageAction } from "@/lib/openwa";
import { getWhatsAppConfig, resolveActiveSessionId } from "@/lib/whatsapp/config";
import { formatCheckinDate, formatCheckinTime, renderMessageTemplate } from "@/lib/whatsapp/render-template";
import type { WhatsAppTemplateKey } from "@/lib/whatsapp/types";

export type WhatsAppSendResult = {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  attempts?: number;
};

export type WhatsAppMessageLogEntry = {
  templateKey: WhatsAppTemplateKey;
  phone: string;
  status: "sent" | "failed";
  sendAttempts: number;
  errorMessage: string | null;
  sentAt: string;
  messagePreview: string;
};

type MessageLogRow = {
  template_key: string;
  phone: string;
  status: string;
  send_attempts: number;
  error_message: string | null;
  sent_at: Date;
  message_body: string;
};

async function getTemplate(templateKey: WhatsAppTemplateKey) {
  const rows = await query<{ body: string; is_enabled: boolean }>(
    "SELECT body, is_enabled FROM whatsapp_message_templates WHERE template_key = $1",
    [templateKey],
  );
  return rows[0] ?? null;
}

async function getMessageLogRow(
  bookingId: string,
  templateKey: WhatsAppTemplateKey,
): Promise<MessageLogRow | null> {
  const rows = await query<MessageLogRow>(
    `SELECT template_key, phone, status, send_attempts, error_message, sent_at, message_body
     FROM whatsapp_message_log
     WHERE booking_id = $1 AND template_key = $2`,
    [bookingId, templateKey],
  );
  return rows[0] ?? null;
}

async function logMessage(input: {
  bookingId: string;
  templateKey: WhatsAppTemplateKey;
  phone: string;
  messageBody: string;
  sessionId: string | null;
  status: "sent" | "failed";
  errorMessage?: string;
  incrementAttempt: boolean;
}) {
  if (input.incrementAttempt) {
    const existing = await getMessageLogRow(input.bookingId, input.templateKey);
    const nextAttempts = (existing?.send_attempts ?? 0) + 1;
    await query(
      `INSERT INTO whatsapp_message_log (
        booking_id, template_key, phone, message_body, openwa_session_id, status, error_message, send_attempts
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (booking_id, template_key) DO UPDATE SET
        phone = EXCLUDED.phone,
        message_body = EXCLUDED.message_body,
        openwa_session_id = EXCLUDED.openwa_session_id,
        status = EXCLUDED.status,
        error_message = EXCLUDED.error_message,
        send_attempts = $9,
        sent_at = NOW()`,
      [
        input.bookingId,
        input.templateKey,
        input.phone,
        input.messageBody,
        input.sessionId,
        input.status,
        input.errorMessage ?? null,
        nextAttempts,
        nextAttempts,
      ],
    );
    return nextAttempts;
  }

  await query(
    `INSERT INTO whatsapp_message_log (
      booking_id, template_key, phone, message_body, openwa_session_id, status, error_message, send_attempts
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,1)
    ON CONFLICT (booking_id, template_key) DO UPDATE SET
      phone = EXCLUDED.phone,
      message_body = EXCLUDED.message_body,
      openwa_session_id = EXCLUDED.openwa_session_id,
      status = EXCLUDED.status,
      error_message = EXCLUDED.error_message,
      send_attempts = 1,
      sent_at = NOW()`,
    [
      input.bookingId,
      input.templateKey,
      input.phone,
      input.messageBody,
      input.sessionId,
      input.status,
      input.errorMessage ?? null,
    ],
  );
  return 1;
}

export async function getBookingWhatsAppLogs(bookingId: string): Promise<WhatsAppMessageLogEntry[]> {
  const rows = await query<MessageLogRow>(
    `SELECT template_key, phone, status, send_attempts, error_message, sent_at, message_body
     FROM whatsapp_message_log
     WHERE booking_id = $1
     ORDER BY sent_at DESC`,
    [bookingId],
  );

  return rows.map((row) => ({
    templateKey: row.template_key as WhatsAppTemplateKey,
    phone: row.phone,
    status: row.status === "sent" ? "sent" : "failed",
    sendAttempts: row.send_attempts,
    errorMessage: row.error_message,
    sentAt: row.sent_at.toISOString(),
    messagePreview: row.message_body.slice(0, 120),
  }));
}

type SendBookingWhatsAppOptions = {
  templateKey: WhatsAppTemplateKey;
  bookingId: string;
  enabled?: boolean;
  requireConfirmed?: boolean;
  extraVariables?: Record<string, string>;
  forceResend?: boolean;
  manualSend?: boolean;
};

export async function sendBookingWhatsApp(
  input: SendBookingWhatsAppOptions,
): Promise<WhatsAppSendResult> {
  const {
    templateKey,
    bookingId,
    enabled = true,
    requireConfirmed = true,
    extraVariables = {},
    forceResend = false,
    manualSend = false,
  } = input;

  try {
    const config = await getWhatsAppConfig();
    const maxAttempts = config.settings.maxSendAttempts;

    if (!manualSend && !enabled) {
      return { sent: false, skipped: true, reason: "Envío desactivado en configuración." };
    }

    const template = await getTemplate(templateKey);
    if (!template?.is_enabled) {
      return { sent: false, skipped: true, reason: "Plantilla desactivada." };
    }

    const existingLog = await getMessageLogRow(bookingId, templateKey);
    if (existingLog?.status === "sent" && !forceResend) {
      return {
        sent: false,
        skipped: true,
        reason: "Ya se envió este mensaje. Marca «Reenviar» para enviarlo otra vez.",
        attempts: existingLog.send_attempts,
      };
    }

    const nextAttempt = (existingLog?.send_attempts ?? 0) + 1;
    if (!forceResend && nextAttempt > maxAttempts) {
      return {
        sent: false,
        skipped: true,
        reason: `Se alcanzó el máximo de ${maxAttempts} intentos. Usa «Reenviar» si necesitas forzar otro envío.`,
        attempts: existingLog?.send_attempts,
      };
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return { sent: false, error: "Reserva no encontrada." };
    }

    if (requireConfirmed && booking.approvalStatus !== "confirmed") {
      return { sent: false, skipped: true, reason: "La reserva debe estar confirmada." };
    }

    const phone = booking.customerPhone.trim();
    if (!phone) {
      return { sent: false, error: "La reserva no tiene teléfono del cliente." };
    }

    const messageBody = renderMessageTemplate(template.body, {
      customer_name: booking.customerName,
      booking_code: booking.bookingCode,
      tour_name: booking.tourName,
      checkin_date: formatCheckinDate(booking.checkinAt),
      checkin_time: formatCheckinTime(booking.checkinAt),
      amount: formatMoneyDisplay(booking.amountCents, booking.currency),
      ...extraVariables,
    });

    let sessionId: string | null = null;
    try {
      sessionId = await resolveActiveSessionId();
      const chatId = `${normalizePhoneNumber(phone, config.settings.defaultCountryCode)}@c.us`;
      await runMessageAction(sessionId, {
        action: "sendText",
        chatId,
        text: messageBody,
      });
      const attempts = await logMessage({
        bookingId,
        templateKey,
        phone,
        messageBody,
        sessionId,
        status: "sent",
        incrementAttempt: Boolean(existingLog),
      });
      return { sent: true, attempts };
    } catch (sendError) {
      const errorMessage = sendError instanceof Error ? sendError.message : "Error al enviar.";
      const attempts = await logMessage({
        bookingId,
        templateKey,
        phone,
        messageBody,
        sessionId,
        status: "failed",
        errorMessage,
        incrementAttempt: Boolean(existingLog),
      });
      return { sent: false, error: errorMessage, attempts };
    }
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Error al preparar el mensaje.",
    };
  }
}

export async function sendBookingConfirmedNotification(
  bookingId: string,
  options: { forceResend?: boolean } = {},
): Promise<WhatsAppSendResult> {
  const config = await getWhatsAppConfig();
  return sendBookingWhatsApp({
    templateKey: "booking_confirmed",
    bookingId,
    enabled: config.settings.sendOnBookingConfirmed,
    forceResend: options.forceResend,
  });
}

export async function sendCheckinReminderNotification(
  bookingId: string,
  options: { forceResend?: boolean; manualSend?: boolean } = {},
): Promise<WhatsAppSendResult> {
  const config = await getWhatsAppConfig();
  return sendBookingWhatsApp({
    templateKey: "checkin_reminder",
    bookingId,
    enabled: config.settings.sendBeforeCheckin,
    forceResend: options.forceResend,
    manualSend: options.manualSend,
  });
}

export async function sendPostExperienceReviewNotification(
  bookingId: string,
  options: { forceResend?: boolean; manualSend?: boolean } = {},
): Promise<WhatsAppSendResult> {
  const config = await getWhatsAppConfig();
  const token = await ensureReviewToken(bookingId);
  const reviewLink = `${getPublicSiteUrl()}/resenas/${token}`;

  return sendBookingWhatsApp({
    templateKey: "post_experience_review",
    bookingId,
    enabled: config.settings.sendAfterExperience,
    extraVariables: { review_link: reviewLink },
    forceResend: options.forceResend,
    manualSend: options.manualSend,
  });
}

export async function confirmExperienceAndRequestReview(
  bookingId: string,
): Promise<{ booking: Awaited<ReturnType<typeof getBookingById>>; whatsapp: WhatsAppSendResult }> {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error("Reserva no encontrada.");
  }
  if (booking.approvalStatus !== "confirmed") {
    throw new Error("Confirma la reserva antes de marcar el disfrute del pasadía.");
  }

  await query(
    `UPDATE bookings SET experience_completed_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [bookingId],
  );

  const whatsapp = await sendPostExperienceReviewNotification(bookingId, {
    forceResend: true,
    manualSend: true,
  });

  const updated = await getBookingById(bookingId);
  return { booking: updated, whatsapp };
}

export async function processDuePostExperienceReviewNotifications(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
  results: Array<{ bookingId: string; bookingCode: string; result: WhatsAppSendResult }>;
}> {
  const config = await getWhatsAppConfig();
  const due = await listBookingsDueForReviewRequest(config.settings.hoursAfterCheckin);

  const results: Array<{ bookingId: string; bookingCode: string; result: WhatsAppSendResult }> = [];
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const booking of due) {
    const result = await sendPostExperienceReviewNotification(booking.id);
    results.push({ bookingId: booking.id, bookingCode: booking.bookingCode, result });
    if (result.sent) {
      sent += 1;
    } else if (result.skipped) {
      skipped += 1;
    } else {
      failed += 1;
    }
  }

  return { processed: due.length, sent, skipped, failed, results };
}
