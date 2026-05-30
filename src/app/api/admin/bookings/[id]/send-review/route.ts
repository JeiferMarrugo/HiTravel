import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { sendPostExperienceReviewNotification } from "@/lib/whatsapp/booking-notifications";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  let forceResend = false;
  try {
    const body = (await request.json()) as { forceResend?: boolean };
    forceResend = Boolean(body.forceResend);
  } catch {
    // cuerpo vacío: envío normal
  }

  try {
    const result = await sendPostExperienceReviewNotification(id, {
      forceResend,
      manualSend: true,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al enviar invitación.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
