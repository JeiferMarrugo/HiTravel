import { NextResponse } from "next/server";
import { getReviewInviteByToken } from "@/lib/catalog/tour-reviews";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.json({ error: "Token requerido." }, { status: 400 });
  }

  const invite = await getReviewInviteByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "Enlace no válido." }, { status: 404 });
  }

  return NextResponse.json({
    bookingCode: invite.bookingCode,
    customerName: invite.customerName,
    tourName: invite.tourName,
    tourSlug: invite.tourSlug,
    alreadyReviewed: invite.alreadyReviewed,
    expired: invite.expired,
  });
}
