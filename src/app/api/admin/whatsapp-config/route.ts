import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { getWhatsAppConfig, updateWhatsAppConfig } from "@/lib/whatsapp/config";
import type { UpdateWhatsAppConfigInput, WhatsAppTemplateKey } from "@/lib/whatsapp/types";

const VALID_TEMPLATE_KEYS = new Set<WhatsAppTemplateKey>([
  "booking_confirmed",
  "checkin_reminder",
  "post_experience_review",
]);

function parseUpdateBody(body: unknown): UpdateWhatsAppConfigInput {
  if (!body || typeof body !== "object") {
    throw new Error("Cuerpo de solicitud inválido.");
  }

  const record = body as Record<string, unknown>;
  const result: UpdateWhatsAppConfigInput = {};

  if (record.settings && typeof record.settings === "object") {
    const settings = record.settings as Record<string, unknown>;
    result.settings = {
      activeSessionId:
        settings.activeSessionId === null
          ? null
          : typeof settings.activeSessionId === "string"
            ? settings.activeSessionId.trim() || null
            : undefined,
      sendOnBookingConfirmed:
        typeof settings.sendOnBookingConfirmed === "boolean"
          ? settings.sendOnBookingConfirmed
          : undefined,
      sendBeforeCheckin:
        typeof settings.sendBeforeCheckin === "boolean" ? settings.sendBeforeCheckin : undefined,
      hoursBeforeCheckin:
        typeof settings.hoursBeforeCheckin === "number"
          ? Math.round(settings.hoursBeforeCheckin)
          : undefined,
      sendAfterExperience:
        typeof settings.sendAfterExperience === "boolean" ? settings.sendAfterExperience : undefined,
      hoursAfterCheckin:
        typeof settings.hoursAfterCheckin === "number"
          ? Math.round(settings.hoursAfterCheckin)
          : undefined,
      maxSendAttempts:
        typeof settings.maxSendAttempts === "number"
          ? Math.round(settings.maxSendAttempts)
          : undefined,
      defaultCountryCode:
        typeof settings.defaultCountryCode === "string"
          ? settings.defaultCountryCode.replace(/\D/g, "")
          : undefined,
    };
  }

  if (Array.isArray(record.templates)) {
    result.templates = record.templates
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => {
        const templateKey = item.templateKey;

        if (typeof templateKey !== "string" || !VALID_TEMPLATE_KEYS.has(templateKey as WhatsAppTemplateKey)) {
          throw new Error(`Plantilla no válida: ${String(templateKey)}`);
        }

        return {
          templateKey: templateKey as WhatsAppTemplateKey,
          body: typeof item.body === "string" ? item.body : undefined,
          isEnabled: typeof item.isEnabled === "boolean" ? item.isEnabled : undefined,
        };
      });
  }

  return result;
}

export async function GET() {
  const session = await requireAdminSession();

  if (isSessionError(session)) {
    return session;
  }

  try {
    return NextResponse.json(await getWhatsAppConfig());
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible cargar la configuración.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();

  if (isSessionError(session)) {
    return session;
  }

  try {
    const body = parseUpdateBody(await request.json());
    const config = await updateWhatsAppConfig(body);
    return NextResponse.json(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible guardar la configuración.";
    const status = message.includes("inválid") || message.includes("deben") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
