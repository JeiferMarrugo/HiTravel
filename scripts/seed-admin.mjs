import bcrypt from "bcryptjs";
import pg from "pg";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.ADMIN_SEED_EMAIL ?? "admin@hitravel.com";
const password = process.env.ADMIN_SEED_PASSWORD;
const fullName = process.env.ADMIN_SEED_NAME ?? "Administrador HI TRAVEL";

if (!databaseUrl) {
  console.error("Falta DATABASE_URL.");
  process.exit(1);
}

if (!password) {
  console.error("Falta ADMIN_SEED_PASSWORD.");
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();
  const passwordHash = await bcrypt.hash(password, 12);

  await client.query(
    `INSERT INTO admin_users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         is_active = TRUE,
         updated_at = NOW()`,
    [email.toLowerCase(), passwordHash, fullName],
  );

  console.log(`Usuario admin listo: ${email}`);
} catch (error) {
  console.error("No fue posible crear el usuario admin:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
