import { query } from "@/lib/db";
import { slugify } from "@/lib/catalog/slug";
import type { TourCategory } from "@/lib/catalog/types";
import { getSiteContent } from "@/lib/site-content";

export type CatalogCurrency = {
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  /** Pesos COP por 1 USD (solo aplica cuando code = USD). */
  copExchangeRate: number | null;
};

export type CatalogCountry = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogOptionsPayload = {
  currencies: CatalogCurrency[];
  countries: CatalogCountry[];
  categories: TourCategory[];
};

type CurrencyRow = {
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  cop_exchange_rate: number | null;
};

type CountryRow = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

function mapCurrency(row: CurrencyRow): CatalogCurrency {
  return {
    code: row.code,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    copExchangeRate: row.cop_exchange_rate,
  };
}

export async function getUsdCopExchangeRate(): Promise<number> {
  const rows = await query<{ cop_exchange_rate: number | null }>(
    "SELECT cop_exchange_rate FROM catalog_currencies WHERE code = 'USD'",
  );
  const fromCurrency = rows[0]?.cop_exchange_rate;
  if (fromCurrency && fromCurrency > 0) {
    return fromCurrency;
  }

  try {
    const content = await getSiteContent();
    return content.pricing.usdCopRate > 0 ? content.pricing.usdCopRate : 4200;
  } catch {
    return 4200;
  }
}

function mapCountry(row: CountryRow): CatalogCountry {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export async function getCatalogOptions(): Promise<CatalogOptionsPayload> {
  const [currencies, countries, categories] = await Promise.all([
    query<CurrencyRow>(
      "SELECT * FROM catalog_currencies ORDER BY sort_order ASC, name ASC",
    ),
    query<CountryRow>(
      "SELECT * FROM catalog_countries ORDER BY sort_order ASC, name ASC",
    ),
    query<{ id: string; slug: string; name: string; sort_order: number }>(
      "SELECT * FROM tour_categories ORDER BY sort_order ASC, name ASC",
    ),
  ]);

  return {
    currencies: currencies.map(mapCurrency),
    countries: countries.map(mapCountry),
    categories: categories.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      sortOrder: row.sort_order,
    })),
  };
}

export async function getActiveCatalogOptions(): Promise<CatalogOptionsPayload> {
  const [currencies, countries, categories] = await Promise.all([
    query<CurrencyRow>(
      "SELECT * FROM catalog_currencies WHERE is_active = TRUE ORDER BY sort_order ASC, name ASC",
    ),
    query<CountryRow>(
      "SELECT * FROM catalog_countries WHERE is_active = TRUE ORDER BY sort_order ASC, name ASC",
    ),
    query<{ id: string; slug: string; name: string; sort_order: number }>(
      "SELECT * FROM tour_categories ORDER BY sort_order ASC, name ASC",
    ),
  ]);

  return {
    currencies: currencies.map(mapCurrency),
    countries: countries.map(mapCountry),
    categories: categories.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      sortOrder: row.sort_order,
    })),
  };
}

export async function createCurrency(
  code: string,
  name: string,
  copExchangeRate?: number | null,
): Promise<CatalogCurrency> {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error("El código de moneda debe tener 3 letras (ej. COP, USD).");
  }
  if (!name.trim()) {
    throw new Error("El nombre de la moneda es obligatorio.");
  }

  let rate: number | null = null;
  if (normalized === "USD") {
    const parsed = Number(copExchangeRate);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("Para USD indica la tasa en pesos colombianos (ej. 4200).");
    }
    rate = Math.round(parsed);
  }

  const rows = await query<CurrencyRow>(
    `INSERT INTO catalog_currencies (code, name, cop_exchange_rate) VALUES ($1, $2, $3) RETURNING *`,
    [normalized, name.trim(), rate],
  );
  return mapCurrency(rows[0]);
}

export async function updateCurrencyExchangeRate(code: string, copExchangeRate: number) {
  const normalized = code.trim().toUpperCase();
  if (normalized !== "USD") {
    throw new Error("La tasa en COP solo aplica a la moneda USD.");
  }
  const rate = Math.round(copExchangeRate);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Indica cuántos pesos colombianos equivalen a 1 USD.");
  }

  const rows = await query(
    `UPDATE catalog_currencies SET cop_exchange_rate = $2 WHERE code = $1 RETURNING code`,
    [normalized, rate],
  );
  if (!rows.length) {
    throw new Error("Moneda USD no encontrada. Agrégala en el catálogo.");
  }
}

export async function deleteCurrency(code: string) {
  const inUse = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM tours WHERE currency = $1",
    [code],
  );
  if (Number(inUse[0]?.count ?? 0) > 0) {
    throw new Error("No se puede eliminar: hay tours con esta moneda.");
  }
  await query("DELETE FROM catalog_currencies WHERE code = $1", [code]);
}

export async function createCountry(name: string): Promise<CatalogCountry> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("El nombre del país es obligatorio.");
  }

  const rows = await query<CountryRow>(
    `INSERT INTO catalog_countries (name) VALUES ($1) RETURNING *`,
    [trimmed],
  );
  return mapCountry(rows[0]);
}

export async function deleteCountry(id: string) {
  const rows = await query<{ name: string }>("SELECT name FROM catalog_countries WHERE id = $1", [
    id,
  ]);
  if (!rows[0]) {
    throw new Error("País no encontrado.");
  }

  const inUse = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM tours WHERE country = $1",
    [rows[0].name],
  );
  if (Number(inUse[0]?.count ?? 0) > 0) {
    throw new Error("No se puede eliminar: hay tours en este país.");
  }
  await query("DELETE FROM catalog_countries WHERE id = $1", [id]);
}

export async function createTourCategory(name: string): Promise<TourCategory> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("El nombre de la categoría es obligatorio.");
  }

  const slug = slugify(trimmed);
  const rows = await query<{ id: string; slug: string; name: string; sort_order: number }>(
    `INSERT INTO tour_categories (slug, name) VALUES ($1, $2) RETURNING *`,
    [slug, trimmed],
  );

  return {
    id: rows[0].id,
    slug: rows[0].slug,
    name: rows[0].name,
    sortOrder: rows[0].sort_order,
  };
}

export async function deleteTourCategory(id: string) {
  await query("UPDATE tours SET category_id = NULL WHERE category_id = $1", [id]);
  const result = await query("DELETE FROM tour_categories WHERE id = $1 RETURNING id", [id]);
  if (!result.length) {
    throw new Error("Categoría no encontrada.");
  }
}

export async function assertCurrencyAllowed(code: string) {
  const rows = await query<{ code: string }>(
    "SELECT code FROM catalog_currencies WHERE code = $1 AND is_active = TRUE",
    [code],
  );
  if (!rows[0]) {
    throw new Error("Moneda no configurada o inactiva. Agrégala en Configuración.");
  }
}

export async function assertCountryAllowed(name: string) {
  const rows = await query<{ name: string }>(
    "SELECT name FROM catalog_countries WHERE name = $1 AND is_active = TRUE",
    [name],
  );
  if (!rows[0]) {
    throw new Error("País no configurado o inactivo. Agrégalo en Configuración.");
  }
}
