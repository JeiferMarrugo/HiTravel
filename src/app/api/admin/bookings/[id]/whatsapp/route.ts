import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import {
  getBookingWhatsAppLogs,
  sendBookingConfirmedNotification,
  sendCheckinReminderNotification,
  sendPostExperienceReviewNotification,
} from "@/lib/whatsapp/booking-notifications";
import { getWhatsAppConfig } from "@/lib/whatsapp/config";
import type { WhatsAppTemplateKey } from "@/lib/whatsapp/types";

type RouteContext = { params: Promise<{ id: string }> };

const TEMPLATE_KEYS: WhatsAppTemplateKey[] = [
  "booking_confirmed",
  "checkin_reminder",
  "post_experience_review",
];

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const [logs, config] = await Promise.all([getBookingWhatsAppLogs(id), getWhatsAppConfig()]);
    return NextResponse.json({
      logs,
      maxSendAttempts: config.settings.maxSendAttempts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar historial.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  let body: { templateKey?: string; forceResend?: boolean };
  try {
    body = (await request.json()) as { templateKey?: string; forceResend?: boolean };
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const templateKey = body.templateKey as WhatsAppTemplateKey | undefined;
  if (!templateKey || !TEMPLATE_KEYS.includes(templateKey)) {
    return NextResponse.json({ error: "Selecciona una plantilla válida." }, { status: 400 });
  }

  const forceResend = Boolean(body.forceResend);

  try {
    let result;
    switch (templateKey) {
      case "booking_confirmed":
        result = await sendBookingConfirmedNotification(id, { forceResend });
        break;
      case "checkin_reminder":
        result = await sendCheckinReminderNotification(id, { forceResend, manualSend: true });
        break;
      case "post_experience_review":
        result = await sendPostExperienceReviewNotification(id, { forceResend, manualSend: true });
        break;
    }

    const logs = await getBookingWhatsAppLogs(id);
    return NextResponse.json({ ...result, logs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al enviar WhatsApp.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
