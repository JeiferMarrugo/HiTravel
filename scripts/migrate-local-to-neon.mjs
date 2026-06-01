import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { loadEnvFiles, parseEnvLine } from "./load-env.mjs";

function readDatabaseUrlFromEnvLocal() {
  const filePath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(filePath)) {
    return null;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (parsed?.key === "DATABASE_URL") {
      return parsed.value.trim();
    }
  }

  return null;
}

loadEnvFiles();

const localUrl =
  process.env.LOCAL_DATABASE_URL?.trim() ||
  readDatabaseUrlFromEnvLocal() ||
  process.env.DATABASE_URL?.trim();
const neonUrl = process.env.NEON_DATABASE_URL?.trim() || process.env.TARGET_DATABASE_URL?.trim();

if (!localUrl) {
  console.error("Falta DATABASE_URL (local en .env.local).");
  process.exit(1);
}

if (!neonUrl) {
  console.error("Falta NEON_DATABASE_URL (connection string de Neon).");
  process.exit(1);
}

function hostLabel(url) {
  try {
    const parsed = new URL(url.replace(/^postgresql:\/\//, "http://"));
    return `${parsed.hostname}:${parsed.port || "5432"}/${parsed.pathname.slice(1)}`;
  } catch {
    return "(url inválida)";
  }
}

/** Padres primero, hijos al final (orden de INSERT). */
const TABLES = [
  "admin_users",
  "catalog_currencies",
  "catalog_countries",
  "catalog_id_types",
  "tour_categories",
  "tours",
  "promotions",
  "site_settings",
  "whatsapp_settings",
  "whatsapp_message_templates",
  "bookings",
  "booking_guests",
  "booking_payments",
  "booking_promotions",
  "booking_review_tokens",
  "tour_reviews",
  "whatsapp_message_log",
];

async function tableExists(client, table) {
  const result = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  );
  return result.rowCount > 0;
}

async function copyTable(local, neon, table) {
  const localExists = await tableExists(local, table);
  const neonExists = await tableExists(neon, table);

  if (!localExists) {
    console.log(`  · ${table}: omitida (no existe en local)`);
    return 0;
  }

  if (!neonExists) {
    console.log(`  · ${table}: omitida (no existe en Neon)`);
    return 0;
  }

  const { rows } = await local.query(`SELECT * FROM ${table}`);
  if (rows.length === 0) {
    console.log(`  · ${table}: 0 filas`);
    return 0;
  }

  const columns = Object.keys(rows[0]);
  const colList = columns.map((c) => `"${c}"`).join(", ");
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

  function normalizeValue(value) {
    if (value === null || value === undefined) {
      return null;
    }
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return value;
  }

  for (const row of rows) {
    const values = columns.map((col) => normalizeValue(row[col]));
    await neon.query(`INSERT INTO ${table} (${colList}) VALUES (${placeholders})`, values);
  }

  console.log(`  · ${table}: ${rows.length} filas`);
  return rows.length;
}

const local = new pg.Client({ connectionString: localUrl });
const neon = new pg.Client({ connectionString: neonUrl });

try {
  console.log("\n--- Migración local → Neon ---");
  console.log(`Origen:  ${hostLabel(localUrl)}`);
  console.log(`Destino: ${hostLabel(neonUrl)}\n`);

  await local.connect();
  await neon.connect();

  const existing = [];
  for (const table of TABLES) {
    if (await tableExists(neon, table)) {
      existing.push(table);
    }
  }

  if (existing.length) {
    console.log("Vaciando tablas en Neon...");
    await neon.query(`TRUNCATE TABLE ${existing.join(", ")} RESTART IDENTITY CASCADE`);
  }

  let total = 0;
  for (const table of TABLES) {
    total += await copyTable(local, neon, table);
  }

  console.log(`\nListo. ${total} filas copiadas en total.\n`);
} catch (error) {
  console.error("\nError durante la migración:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await local.end().catch(() => undefined);
  await neon.end().catch(() => undefined);
}
