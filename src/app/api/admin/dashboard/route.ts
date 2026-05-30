import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { getDashboardMetrics } from "@/lib/admin/dashboard-metrics";

export async function GET() {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    return NextResponse.json(await getDashboardMetrics());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar el dashboard.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
