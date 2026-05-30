import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { getPaymentsCashReport, listAllPayments } from "@/lib/catalog/payments";
import type { PaymentMethod } from "@/lib/catalog/types";

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

function parseFilters(searchParams: URLSearchParams) {
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();
  const paymentMethod = searchParams.get("method")?.trim();
  const currency = searchParams.get("currency")?.trim();

  if (paymentMethod && !VALID_METHODS.has(paymentMethod as PaymentMethod)) {
    throw new Error("Método de pago no válido.");
  }

  return {
    from: from ? `${from}T00:00:00.000Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
    paymentMethod: paymentMethod ? (paymentMethod as PaymentMethod) : undefined,
    currency: currency || undefined,
  };
}

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const filters = parseFilters(new URL(request.url).searchParams);
    const [payments, report] = await Promise.all([
      listAllPayments(filters),
      getPaymentsCashReport(filters),
    ]);
    return NextResponse.json({ payments, report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar pagos.";
    const httpStatus = message.includes("válido") ? 400 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}
