import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { calculateBookingPromotions } from "@/lib/catalog/booking-promotion-calc";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const tourId = typeof body.tourId === "string" ? body.tourId : "";
    const checkinAt = typeof body.checkinAt === "string" ? body.checkinAt : "";
    const adults = Number(body.adults) || 1;
    const children = Number(body.children) || 0;

    const promotionIds = Array.isArray(body.promotionIds)
      ? body.promotionIds.filter((id): id is string => typeof id === "string")
      : typeof body.promotionId === "string" && body.promotionId
        ? [body.promotionId]
        : [];

    if (!tourId) {
      throw new Error("Selecciona un tour.");
    }
    if (!checkinAt) {
      throw new Error("Indica la fecha de salida.");
    }

    const { tour, result } = await calculateBookingPromotions({
      tourId,
      promotionIds,
      adults,
      children,
      checkinAt,
    });

    return NextResponse.json({
      subtotalCents: result.subtotalCents,
      discountCents: result.discountCents,
      totalCents: result.totalCents,
      currency: tour.currency,
      lines: result.lines,
      descriptions: result.descriptions,
      promotionNames: result.lines.map((line) => line.promotionName).join(" + "),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible calcular.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
