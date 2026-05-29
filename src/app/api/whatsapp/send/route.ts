import { NextResponse } from "next/server";
import { sendTextMessage } from "@/lib/openwa";

type SendRequestBody = {
  message?: string;
  phoneNumber?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendRequestBody;
    const phoneNumber = body.phoneNumber?.trim();
    const message = body.message?.trim();

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: "Indica el número de destino y el mensaje." }, { status: 400 });
    }

    const payload = await sendTextMessage({ phoneNumber, text: message });

    return NextResponse.json({
      ok: true,
      message: "Mensaje enviado correctamente.",
      payload,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible enviar el mensaje.";
    const status = message.startsWith("Falta configurar OPENWA_") ? 503 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
