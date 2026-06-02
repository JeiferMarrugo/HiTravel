import { query } from "@/lib/db";

export type ContactSubmissionRecord = {
  id: string;
  full_name: string;
  email: string;
  phone_e164: string;
  message: string;
  client_whatsapp_sent: boolean;
  admin_whatsapp_sent: boolean;
  created_at: Date;
};

export type CreateContactSubmissionInput = {
  fullName: string;
  email: string;
  phoneE164: string;
  message: string;
};

export async function createContactSubmission(input: CreateContactSubmissionInput) {
  const rows = await query<{ id: string }>(
    `INSERT INTO contact_submissions (full_name, email, phone_e164, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [input.fullName, input.email, input.phoneE164, input.message],
  );

  return rows[0]?.id ?? null;
}

export async function markContactSubmissionWhatsAppStatus(
  id: string,
  status: { clientSent: boolean; adminSent: boolean },
) {
  await query(
    `UPDATE contact_submissions
     SET client_whatsapp_sent = $2, admin_whatsapp_sent = $3
     WHERE id = $1`,
    [id, status.clientSent, status.adminSent],
  );
}

export async function listRecentContactSubmissions(limit = 50) {
  return query<ContactSubmissionRecord>(
    `SELECT id, full_name, email, phone_e164, message, client_whatsapp_sent, admin_whatsapp_sent, created_at
     FROM contact_submissions
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  );
}

export async function listContactSubmissions(options: { search?: string; limit?: number } = {}) {
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 500);
  const search = options.search?.trim();

  if (search) {
    const pattern = `%${search}%`;
    return query<ContactSubmissionRecord>(
      `SELECT id, full_name, email, phone_e164, message, client_whatsapp_sent, admin_whatsapp_sent, created_at
       FROM contact_submissions
       WHERE full_name ILIKE $1
          OR email ILIKE $1
          OR phone_e164 ILIKE $1
          OR message ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [pattern, limit],
    );
  }

  return listRecentContactSubmissions(limit);
}
