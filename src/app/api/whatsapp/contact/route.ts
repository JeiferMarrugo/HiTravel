import { NextResponse } from "next/server";
import { processContactFormSubmission } from "@/lib/contact/contact-notifications";

type ContactRequestBody = {
  email?: string;
  message?: string;
  name?: string;
  phone?: string;
};

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

    const result = await processContactFormSubmission({ name, email, phone, message });

    return NextResponse.json({
      ok: true,
      message: result.userMessage,
      whatsapp: {
        client: result.clientWhatsAppSent,
        admin: result.adminWhatsAppSent,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "No fue posible procesar el mensaje.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
