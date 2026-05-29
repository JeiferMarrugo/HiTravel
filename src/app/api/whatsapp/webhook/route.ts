import { NextResponse } from "next/server";
import { readOpenWaEnvironment, verifyWebhookSignature } from "@/lib/openwa";

function getSignatureFromHeaders(headers: Headers) {
  return (
    headers.get("x-openwa-signature") ??
    headers.get("x-signature") ??
    headers.get("x-hub-signature-256") ??
    headers.get("x-webhook-signature")
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Webhook OpenWA listo para recibir eventos.",
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = getSignatureFromHeaders(request.headers);
  const webhookSecret = readOpenWaEnvironment().webhookSecret;

  if (webhookSecret) {
    if (!signature || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Firma de webhook inválida." }, { status: 401 });
    }
  }

  let payload: unknown = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as unknown;
    } catch {
      payload = rawBody;
    }
  }

  console.info("[openwa:webhook]", {
    hasSignature: Boolean(signature),
    receivedAt: new Date().toISOString(),
    summary: payload && typeof payload === "object" ? Object.keys(payload as Record<string, unknown>) : payload,
  });

  return NextResponse.json({ ok: true });
}
