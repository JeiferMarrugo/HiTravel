import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { deleteBooking, getBookingById, updateBooking } from "@/lib/catalog/bookings";
import type { UpdateBookingInput } from "@/lib/catalog/types";
import { sendBookingConfirmedNotification } from "@/lib/whatsapp/booking-notifications";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar reserva.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as UpdateBookingInput & Record<string, unknown>;
    if (body.checkinAt) {
      body.checkinAt = new Date(body.checkinAt).toISOString();
    }

    const previous = await getBookingById(id);
    const booking = await updateBooking(id, body);

    let whatsapp:
      | Awaited<ReturnType<typeof sendBookingConfirmedNotification>>
      | undefined;

    if (
      previous?.approvalStatus !== "confirmed" &&
      booking.approvalStatus === "confirmed"
    ) {
      whatsapp = await sendBookingConfirmedNotification(id);
    }

    return NextResponse.json({ ...booking, whatsapp });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar reserva.";
    const httpStatus =
      message.includes("obligatorio") || message.includes("no encontrada") ? 400 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    await deleteBooking(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar reserva.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
