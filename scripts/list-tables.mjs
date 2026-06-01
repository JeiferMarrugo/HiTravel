import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });
try {
  const tables = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
  );
  console.log("Tables:", tables.rows.length);
  console.log(tables.rows.map((r) => r.tablename).join(", ") || "(none)");
} finally {
  await pool.end();
}
