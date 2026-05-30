import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { getBookingWithPayments, createBookingPayment } from "@/lib/catalog/payments";
import type { CreateBookingPaymentInput, PaymentMethod } from "@/lib/catalog/types";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_METHODS = new Set<PaymentMethod>([
  "transferencia",
  "consignacion",
  "efectivo",
  "nequi",
  "daviplata",
  "tarjeta",
  "paypal",
  "otro",
]);

function parsePaymentBody(body: Record<string, unknown>): CreateBookingPaymentInput {
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Indica un monto válido mayor a cero.");
  }

  const paymentMethod = body.paymentMethod;
  if (typeof paymentMethod !== "string" || !VALID_METHODS.has(paymentMethod as PaymentMethod)) {
    throw new Error("Selecciona un método de pago.");
  }

  return {
    amount,
    paymentMethod: paymentMethod as PaymentMethod,
    reference: typeof body.reference === "string" ? body.reference : undefined,
    voucherUrl: typeof body.voucherUrl === "string" ? body.voucherUrl : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
    paidAt: typeof body.paidAt === "string" ? body.paidAt : undefined,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const data = await getBookingWithPayments(id);
    if (!data) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar pagos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const body = parsePaymentBody((await request.json()) as Record<string, unknown>);
    const data = await createBookingPayment(id, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al registrar pago.";
    const httpStatus =
      message.includes("válido") ||
      message.includes("Selecciona") ||
      message.includes("encontrada") ||
      message.includes("saldo")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}
