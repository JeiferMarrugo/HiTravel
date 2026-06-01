import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { listTravelersOverview } from "@/lib/catalog/guests-overview";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const bookingCode = searchParams.get("bookingCode") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "200");

  try {
    const travelers = await listTravelersOverview({ search, bookingCode, limit });
    return NextResponse.json({ travelers, total: travelers.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible cargar huéspedes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
