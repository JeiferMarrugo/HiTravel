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

const sqlFiles = [
  "init-auth.sql",
  "init-business.sql",
  "init-catalog.sql",
  "init-catalog-options.sql",
  "init-site-content.sql",
  "init-payments.sql",
  "init-promotions.sql",
  "init-tour-reviews.sql",
  "init-whatsapp-enhancements.sql",
  "init-booking-travelers.sql",
];
const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();

  for (const file of sqlFiles) {
    const sqlPath = path.join(process.cwd(), "scripts", file);
    const sql = fs.readFileSync(sqlPath, "utf8");
    await client.query(sql);
    console.log(`${file} aplicado.`);
  }

  console.log("Base de datos inicializada.");
} catch (error) {
  console.error("No fue posible inicializar la base de datos:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
