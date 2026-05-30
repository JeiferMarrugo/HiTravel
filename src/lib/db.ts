import { Pool } from "pg";

let pool: Pool | null = null;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("Falta configurar DATABASE_URL.");
  }
  return url;
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return pool;
}

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}
