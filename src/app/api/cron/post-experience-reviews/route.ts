import { NextResponse } from "next/server";
import { isValidWatchdogSecret } from "@/lib/openwa-watchdog";
import { processDuePostExperienceReviewNotifications } from "@/lib/whatsapp/booking-notifications";

export async function GET(request: Request) {
  if (!isValidWatchdogSecret(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const result = await processDuePostExperienceReviewNotifications();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al procesar reseñas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
