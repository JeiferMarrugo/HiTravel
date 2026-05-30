import pg from "pg";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Falta DATABASE_URL.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();
  const exists = await client.query(
    "SELECT content FROM site_settings WHERE id = 1 AND content <> '{}'::jsonb",
  );
  if (exists.rows[0]) {
    console.log("Contenido del sitio ya configurado; seed omitido.");
    process.exit(0);
  }
  console.log("Ejecuta npm run db:init y guarda desde Admin → Configuración, o el sitio usará valores por defecto en código.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}
