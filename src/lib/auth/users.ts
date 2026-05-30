import { query } from "@/lib/db";
import type { AdminUser } from "@/lib/auth/types";

type AdminUserRow = AdminUser & {
  password_hash: string;
};

export async function findAdminUserByEmail(email: string): Promise<AdminUserRow | null> {
  const rows = await query<AdminUserRow>(
    `SELECT id, email, password_hash, full_name, role, is_active
     FROM admin_users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email.trim()],
  );

  return rows[0] ?? null;
}

export async function findAdminUserById(id: string): Promise<AdminUser | null> {
  const rows = await query<AdminUser>(
    `SELECT id, email, full_name, role, is_active
     FROM admin_users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return rows[0] ?? null;
}

export async function updateAdminUserProfile(
  id: string,
  data: { fullName: string; passwordHash?: string },
): Promise<AdminUser | null> {
  const rows = data.passwordHash
    ? await query<AdminUser>(
        `UPDATE admin_users
         SET full_name = $2,
             password_hash = $3,
             updated_at = NOW()
         WHERE id = $1 AND is_active = TRUE
         RETURNING id, email, full_name, role, is_active`,
        [id, data.fullName.trim(), data.passwordHash],
      )
    : await query<AdminUser>(
        `UPDATE admin_users
         SET full_name = $2,
             updated_at = NOW()
         WHERE id = $1 AND is_active = TRUE
         RETURNING id, email, full_name, role, is_active`,
        [id, data.fullName.trim()],
      );

  return rows[0] ?? null;
}

export async function getAdminUserPasswordHash(id: string): Promise<string | null> {
  const rows = await query<{ password_hash: string }>(
    `SELECT password_hash
     FROM admin_users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return rows[0]?.password_hash ?? null;
}
