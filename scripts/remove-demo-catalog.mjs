import pg from "pg";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const demoSlugs = ["rosario-vip", "cartagena-historica", "tayrona-aventura", "dia-playa-baru"];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Falta DATABASE_URL.");
  process.exit(1);
}

const client = new pg.Client({ connectionString });

try {
  await client.connect();
  const result = await client.query("DELETE FROM tours WHERE slug = ANY($1::text[])", [demoSlugs]);
  console.log(`Eliminados ${result.rowCount} tour(s) de demostración del catálogo público.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}
