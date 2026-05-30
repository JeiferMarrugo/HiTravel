import pg from "pg";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Falta DATABASE_URL en .env.local");
  process.exit(1);
}

const parsed = new URL(databaseUrl.replace(/^postgresql:\/\//, "http://"));
const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();

  const promoCount = await client.query(
    "SELECT COUNT(*)::int AS n FROM promotions WHERE is_active = TRUE",
  );
  const tour = await client.query(
    `SELECT slug, price_from_cents, currency, name
     FROM tours WHERE slug = 'dia-playa-baru' LIMIT 1`,
  );
  const allTours = await client.query(
    "SELECT COUNT(*)::int AS n FROM tours WHERE is_active = TRUE",
  );

  console.log("\n--- Estado de la base (la que usa DATABASE_URL) ---");
  console.log(`Host: ${parsed.hostname}:${parsed.port || "5432"}`);
  console.log(`Base: ${parsed.pathname.replace(/^\//, "")}`);
  console.log(`Tours activos: ${allTours.rows[0]?.n ?? 0}`);
  console.log(`Promociones activas: ${promoCount.rows[0]?.n ?? 0}`);

  if (tour.rows[0]) {
    const row = tour.rows[0];
    console.log(
      `\n«${row.name}» (${row.slug}): precio almacenado = ${row.price_from_cents} ${row.currency}`,
    );
  } else {
    console.log("\nNo hay tour dia-playa-baru en esta base.");
  }

  console.log(
    "\nSi Docker y local muestran precios distintos, casi seguro están usando bases distintas.",
    "\nUsa solo Postgres de Docker: npm run docker:db  y  npm run db:status  para comprobar.\n",
  );
} catch (error) {
  console.error("No se pudo conectar:", error instanceof Error ? error.message : error);
  console.error("¿Está corriendo Postgres? Prueba: npm run docker:db");
  process.exitCode = 1;
} finally {
  await client.end();
}
