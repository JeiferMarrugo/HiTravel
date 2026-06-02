import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { listContactSubmissions } from "@/lib/contact/contact-submissions";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "100");

  try {
    const submissions = await listContactSubmissions({ search, limit });
    return NextResponse.json({
      submissions: submissions.map((row) => ({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phoneE164: row.phone_e164,
        message: row.message,
        clientWhatsAppSent: row.client_whatsapp_sent,
        adminWhatsAppSent: row.admin_whatsapp_sent,
        createdAt: row.created_at.toISOString(),
      })),
      total: submissions.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible cargar contactos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
