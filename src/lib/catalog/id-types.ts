import { query } from "@/lib/db";

export type CatalogIdType = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type IdTypeRow = {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

function mapRow(row: IdTypeRow): CatalogIdType {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export async function listIdTypes(activeOnly = false): Promise<CatalogIdType[]> {
  const rows = await query<IdTypeRow>(
    `SELECT id, code, name, sort_order, is_active
     FROM catalog_id_types
     ${activeOnly ? "WHERE is_active = TRUE" : ""}
     ORDER BY sort_order ASC, name ASC`,
  );
  return rows.map(mapRow);
}

export async function createIdType(code: string, name: string): Promise<void> {
  const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, "");
  const normalizedName = name.trim();
  if (!normalizedCode || !normalizedName) {
    throw new Error("Código y nombre son obligatorios.");
  }

  await query(
    `INSERT INTO catalog_id_types (code, name, sort_order)
     VALUES ($1, $2, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM catalog_id_types))`,
    [normalizedCode, normalizedName],
  );
}

export async function deleteIdType(id: string): Promise<void> {
  await query("DELETE FROM catalog_id_types WHERE id = $1", [id]);
}

export async function setIdTypeActive(id: string, isActive: boolean): Promise<void> {
  await query("UPDATE catalog_id_types SET is_active = $2 WHERE id = $1", [id, isActive]);
}

export async function getIdTypeById(id: string): Promise<CatalogIdType | null> {
  const rows = await query<IdTypeRow>(
    "SELECT id, code, name, sort_order, is_active FROM catalog_id_types WHERE id = $1",
    [id],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}
