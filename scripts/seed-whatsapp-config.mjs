import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Falta DATABASE_URL.");
  process.exit(1);
}

const sessionId = process.env.OPENWA_SESSION_ID?.trim() || null;

const templates = [
  {
    template_key: "booking_confirmed",
    name: "Reserva confirmada",
    description: "Se envía al confirmar la reserva (botón Confirmar en Reservas), no al registrar pagos.",
    body:
      "Hola {{customer_name}}, tu reserva {{booking_code}} para *{{tour_name}}* el {{checkin_date}} está confirmada. ¡Gracias por elegir HI TRAVEL!",
  },
  {
    template_key: "checkin_reminder",
    name: "Recordatorio antes del check-in",
    description: "Se envía X horas antes de la fecha/hora de salida (check-in).",
    body:
      "Hola {{customer_name}}, te recordamos tu experiencia *{{tour_name}}* el {{checkin_date}} ({{checkin_time}}). Si tienes dudas, escríbenos. — HI TRAVEL",
  },
  {
    template_key: "post_experience_review",
    name: "Invitación a dejar reseña",
    description:
      "Se envía tras la experiencia (horas después del check-in). Incluye enlace único por reserva.",
    body:
      "¡Hola {{customer_name}}! Esperamos que hayas disfrutado *{{tour_name}}* (reserva {{booking_code}}).\n\nTu opinión nos ayuda mucho. Déjanos tu reseña aquí:\n{{review_link}}\n\n— HI TRAVEL",
  },
];

const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();

  for (const template of templates) {
    await client.query(
      `INSERT INTO whatsapp_message_templates (template_key, name, description, body)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (template_key) DO NOTHING`,
      [template.template_key, template.name, template.description, template.body],
    );
  }

  if (sessionId) {
    await client.query(
      `UPDATE whatsapp_settings
       SET active_session_id = $1, updated_at = NOW()
       WHERE id = 1`,
      [sessionId],
    );
  }

  console.log("Plantillas y ajustes WhatsApp listos.");
} catch (error) {
  console.error("No fue posible sembrar configuración WhatsApp:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
