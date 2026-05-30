import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { setBookingAttended } from "@/lib/catalog/bookings";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { attended?: boolean };
    const booking = await setBookingAttended(id, body.attended !== false);
    return NextResponse.json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
