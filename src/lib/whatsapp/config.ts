import { query } from "@/lib/db";
import { listSessions } from "@/lib/openwa";
import type {
  UpdateWhatsAppConfigInput,
  WhatsAppConfigPayload,
  WhatsAppMessageTemplate,
  WhatsAppSettings,
  WhatsAppTemplateKey,
} from "@/lib/whatsapp/types";
import { TEMPLATE_PLACEHOLDERS } from "@/lib/whatsapp/types";

type SettingsRow = {
  active_session_id: string | null;
  send_on_booking_confirmed: boolean;
  send_before_checkin: boolean;
  hours_before_checkin: number;
  send_after_experience: boolean;
  hours_after_checkin: number;
  max_send_attempts: number;
  default_country_code: string;
  updated_at: Date;
};

type TemplateRow = {
  template_key: string;
  name: string;
  description: string | null;
  body: string;
  is_enabled: boolean;
  updated_at: Date;
};

function mapSettings(row: SettingsRow): WhatsAppSettings {
  return {
    activeSessionId: row.active_session_id,
    sendOnBookingConfirmed: row.send_on_booking_confirmed,
    sendBeforeCheckin: row.send_before_checkin,
    hoursBeforeCheckin: row.hours_before_checkin,
    sendAfterExperience: row.send_after_experience ?? true,
    hoursAfterCheckin: row.hours_after_checkin ?? 12,
    maxSendAttempts: row.max_send_attempts ?? 3,
    defaultCountryCode: row.default_country_code,
    updatedAt: row.updated_at.toISOString(),
  };
}

function mapTemplate(row: TemplateRow): WhatsAppMessageTemplate {
  return {
    templateKey: row.template_key as WhatsAppTemplateKey,
    name: row.name,
    description: row.description,
    body: row.body,
    isEnabled: row.is_enabled,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getWhatsAppConfig(): Promise<WhatsAppConfigPayload> {
  const [settingsRows, templateRows] = await Promise.all([
    query<SettingsRow>("SELECT * FROM whatsapp_settings WHERE id = 1"),
    query<TemplateRow>(
      "SELECT * FROM whatsapp_message_templates ORDER BY template_key ASC",
    ),
  ]);

  const settingsRow = settingsRows[0];

  if (!settingsRow) {
    throw new Error("No existe la fila de configuración WhatsApp (whatsapp_settings).");
  }

  return {
    settings: mapSettings(settingsRow),
    templates: templateRows.map(mapTemplate),
    placeholders: [...TEMPLATE_PLACEHOLDERS],
  };
}

export async function updateWhatsAppConfig(input: UpdateWhatsAppConfigInput): Promise<WhatsAppConfigPayload> {
  if (input.settings) {
    const {
      activeSessionId,
      sendOnBookingConfirmed,
      sendBeforeCheckin,
      hoursBeforeCheckin,
      sendAfterExperience,
      hoursAfterCheckin,
      maxSendAttempts,
      defaultCountryCode,
    } = input.settings;

    if (hoursBeforeCheckin !== undefined && (hoursBeforeCheckin < 1 || hoursBeforeCheckin > 168)) {
      throw new Error("Las horas antes del check-in deben estar entre 1 y 168.");
    }

    if (hoursAfterCheckin !== undefined && (hoursAfterCheckin < 1 || hoursAfterCheckin > 168)) {
      throw new Error("Las horas después del check-in deben estar entre 1 y 168.");
    }

    if (maxSendAttempts !== undefined && (maxSendAttempts < 1 || maxSendAttempts > 10)) {
      throw new Error("Los intentos máximos de envío deben estar entre 1 y 10.");
    }

    if (defaultCountryCode !== undefined && !/^\d{1,5}$/.test(defaultCountryCode)) {
      throw new Error("El indicativo de país debe ser numérico.");
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    if (activeSessionId !== undefined) {
      fields.push(`active_session_id = $${fields.length + 1}`);
      values.push(activeSessionId);
    }

    if (sendOnBookingConfirmed !== undefined) {
      fields.push(`send_on_booking_confirmed = $${fields.length + 1}`);
      values.push(sendOnBookingConfirmed);
    }

    if (sendBeforeCheckin !== undefined) {
      fields.push(`send_before_checkin = $${fields.length + 1}`);
      values.push(sendBeforeCheckin);
    }

    if (hoursBeforeCheckin !== undefined) {
      fields.push(`hours_before_checkin = $${fields.length + 1}`);
      values.push(hoursBeforeCheckin);
    }

    if (sendAfterExperience !== undefined) {
      fields.push(`send_after_experience = $${fields.length + 1}`);
      values.push(sendAfterExperience);
    }

    if (hoursAfterCheckin !== undefined) {
      fields.push(`hours_after_checkin = $${fields.length + 1}`);
      values.push(hoursAfterCheckin);
    }

    if (maxSendAttempts !== undefined) {
      fields.push(`max_send_attempts = $${fields.length + 1}`);
      values.push(maxSendAttempts);
    }

    if (defaultCountryCode !== undefined) {
      fields.push(`default_country_code = $${fields.length + 1}`);
      values.push(defaultCountryCode);
    }

    if (fields.length) {
      fields.push("updated_at = NOW()");
      await query(`UPDATE whatsapp_settings SET ${fields.join(", ")} WHERE id = 1`, values);
    }
  }

  if (input.templates?.length) {
    for (const template of input.templates) {
      if (!template.body?.trim() && template.isEnabled === undefined) {
        continue;
      }

      await query(
        `UPDATE whatsapp_message_templates SET
          body = COALESCE($2, body),
          is_enabled = COALESCE($3, is_enabled),
          updated_at = NOW()
        WHERE template_key = $1`,
        [
          template.templateKey,
          template.body?.trim() ?? null,
          template.isEnabled ?? null,
        ],
      );
    }
  }

  return getWhatsAppConfig();
}

export async function persistActiveSessionId(sessionId: string | null): Promise<void> {
  await query(
    `UPDATE whatsapp_settings SET active_session_id = $1, updated_at = NOW() WHERE id = 1`,
    [sessionId],
  );
}

export async function resolveActiveSessionId(): Promise<string> {
  const config = await getWhatsAppConfig();
  const preferred =
    config.settings.activeSessionId?.trim() || process.env.OPENWA_SESSION_ID?.trim() || "";

  let sessions: Awaited<ReturnType<typeof listSessions>> = [];

  try {
    sessions = await listSessions();
  } catch {
    // OpenWA no respondió; se intentará con el ID configurado manualmente.
  }

  if (preferred && sessions.length) {
    const match = sessions.find((session) => session.id === preferred);

    if (match?.status === "ready") {
      return preferred;
    }

    if (match) {
      throw new Error(
        `La sesión «${match.name}» no está conectada (estado: ${match.status}). Ve a Admin → WhatsApp, pulsa Iniciar o Ver QR y escanea con tu teléfono.`,
      );
    }
  }

  const readySession = sessions.find((session) => session.status === "ready");

  if (readySession) {
    if (readySession.id !== config.settings.activeSessionId) {
      await persistActiveSessionId(readySession.id);
    }
    return readySession.id;
  }

  if (sessions.length) {
    const hint = sessions[0];
    throw new Error(
      `Ninguna sesión WhatsApp está conectada. «${hint.name}» está en estado «${hint.status}». Abre Admin → WhatsApp, escanea el QR y espera a que diga ready.`,
    );
  }

  if (preferred) {
    return preferred;
  }

  throw new Error(
    "No hay sesión WhatsApp conectada. Crea una en Admin → WhatsApp, escanea el QR y vuelve a intentar el envío.",
  );
}
