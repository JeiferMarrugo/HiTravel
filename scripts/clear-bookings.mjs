import pg from "pg";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Falta DATABASE_URL.");
  process.exit(1);
}

const client = new pg.Client({ connectionString });

try {
  await client.connect();
  const before = await client.query("SELECT COUNT(*)::int AS count FROM bookings");
  await client.query("DELETE FROM bookings");
  const count = before.rows[0]?.count ?? 0;
  console.log(`Eliminadas ${count} reserva(s) de prueba o históricas.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('relation "bookings" does not exist')) {
    console.error("La tabla bookings no existe. Ejecuta primero: npm run db:init");
  } else {
    console.error(message);
  }
  process.exitCode = 1;
} finally {
  await client.end();
}
