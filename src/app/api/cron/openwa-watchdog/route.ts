import { NextResponse } from "next/server";
import { ensureOpenWaSession, isValidWatchdogSecret, isWatchdogEnabled } from "@/lib/openwa-watchdog";

export async function GET(request: Request) {
  if (!isValidWatchdogSecret(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!isWatchdogEnabled()) {
    return NextResponse.json(
      {
        error: "Watchdog deshabilitado. Activa OPENWA_AUTO_START=true y configura OPENWA_SESSION_ID.",
      },
      { status: 503 },
    );
  }

  try {
    const result = await ensureOpenWaSession();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible ejecutar el watchdog.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
