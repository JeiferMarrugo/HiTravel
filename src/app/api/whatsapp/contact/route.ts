import { NextResponse } from "next/server";
import { getConfiguredTargetPhone, sendTextMessage } from "@/lib/openwa";

type ContactRequestBody = {
  email?: string;
  message?: string;
  name?: string;
  phone?: string;
};

function formatContactMessage({ email, message, name, phone }: Required<ContactRequestBody>) {
  return [
    "Nuevo lead desde el formulario de contacto de HI TRAVEL",
    "",
    `Nombre: ${name}`,
    `Correo: ${email}`,
    `Teléfono: ${phone}`,
    "",
    "Mensaje:",
    message,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequestBody;
    const name = body.name?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const message = body.message?.trim();

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: "Completa todos los campos del formulario." }, { status: 400 });
    }

    await sendTextMessage({
      phoneNumber: getConfiguredTargetPhone(),
      text: formatContactMessage({ email, message, name, phone }),
    });

    return NextResponse.json({ ok: true, message: "Mensaje enviado por WhatsApp." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible procesar el mensaje.";
    const status = message.startsWith("Falta configurar OPENWA_") ? 503 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
