import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { deleteBookingPayment } from "@/lib/catalog/payments";

type RouteContext = { params: Promise<{ id: string; paymentId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id, paymentId } = await context.params;

  try {
    const data = await deleteBookingPayment(id, paymentId);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar pago.";
    const httpStatus = message.includes("encontrad") ? 404 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}
