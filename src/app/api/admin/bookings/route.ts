import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { createBooking, getBookingStats, listBookings } from "@/lib/catalog/bookings";
import { parseMoneyInput } from "@/lib/catalog/money";
import type { ApprovalStatus, CreateBookingInput, PaymentStatus } from "@/lib/catalog/types";

function parseBookingBody(body: Record<string, unknown>): CreateBookingInput {
  if (typeof body.tourId !== "string" || !body.tourId) {
    throw new Error("Selecciona un tour o paquete.");
  }

  if (typeof body.customerName !== "string" || !body.customerName.trim()) {
    throw new Error("El nombre del cliente es obligatorio.");
  }

  if (typeof body.customerPhone !== "string" || !body.customerPhone.trim()) {
    throw new Error("El teléfono del cliente es obligatorio.");
  }

  if (typeof body.checkinAt !== "string" || !body.checkinAt) {
    throw new Error("Indica la fecha y hora de check-in / salida.");
  }

  const currency = typeof body.currency === "string" ? body.currency : "COP";
  const amountRaw = body.amountCents !== undefined && body.amountCents !== "" ? Number(body.amountCents) : undefined;

  return {
    tourId: body.tourId,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerEmail: typeof body.customerEmail === "string" ? body.customerEmail : undefined,
    checkinAt: new Date(body.checkinAt).toISOString(),
    amountCents:
      amountRaw !== undefined && Number.isFinite(amountRaw) && amountRaw > 0
        ? parseMoneyInput(amountRaw, currency)
        : undefined,
    currency,
    adults: Number(body.adults) || 1,
    children: Number(body.children) || 0,
    paymentStatus: (body.paymentStatus as PaymentStatus) ?? "pending",
    approvalStatus: (body.approvalStatus as ApprovalStatus) ?? "pending",
    notes: typeof body.notes === "string" ? body.notes : undefined,
    promotionId: typeof body.promotionId === "string" && body.promotionId ? body.promotionId : null,
    promotionIds: Array.isArray(body.promotionIds)
      ? body.promotionIds.filter((id): id is string => typeof id === "string")
      : undefined,
    subtotalCents:
      body.subtotalCents !== undefined && body.subtotalCents !== ""
        ? Number(body.subtotalCents)
        : undefined,
    discountCents:
      body.discountCents !== undefined && body.discountCents !== ""
        ? Number(body.discountCents)
        : undefined,
  };
}

export async function GET() {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const [bookings, stats] = await Promise.all([listBookings(), getBookingStats()]);
    return NextResponse.json({ bookings, stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al listar reservas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const body = parseBookingBody((await request.json()) as Record<string, unknown>);
    const booking = await createBooking(body);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear reserva.";
    const status = message.includes("obligatorio") || message.includes("Selecciona") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
