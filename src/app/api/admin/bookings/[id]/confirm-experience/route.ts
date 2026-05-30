import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { confirmExperienceAndRequestReview } from "@/lib/whatsapp/booking-notifications";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const { booking, whatsapp } = await confirmExperienceAndRequestReview(id);
    return NextResponse.json({ booking, whatsapp });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al confirmar disfrute.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
