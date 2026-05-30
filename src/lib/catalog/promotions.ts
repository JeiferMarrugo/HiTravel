import { query } from "@/lib/db";
import { ensureUniqueSlug, slugify } from "@/lib/catalog/slug";
import type { PromotionConfig, PromotionType } from "@/lib/catalog/promotion-types";
import type { CreatePromotionInput, PromotionRecord, UpdatePromotionInput } from "@/lib/catalog/types";

const VALID_TYPES = new Set<PromotionType>([
  "percent_discount",
  "fixed_discount",
  "free_child",
  "second_passenger_discount",
  "group_discount",
  "early_booking",
]);

type PromotionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  promotion_type: PromotionType;
  config: PromotionConfig;
  tour_ids: string[] | null;
  valid_from: Date | null;
  valid_until: Date | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

function mapPromotion(row: PromotionRow): PromotionRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    promotionType: row.promotion_type,
    config: row.config ?? {},
    tourIds: row.tour_ids,
    validFrom: row.valid_from?.toISOString() ?? null,
    validUntil: row.valid_until?.toISOString() ?? null,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function validateConfig(type: PromotionType, config: PromotionConfig) {
  switch (type) {
    case "percent_discount":
      if (!config.percent || config.percent <= 0 || config.percent > 100) {
        throw new Error("Indica un porcentaje entre 1 y 100.");
      }
      break;
    case "fixed_discount":
      if (!config.amount || config.amount <= 0) {
        throw new Error("Indica un monto fijo mayor a cero.");
      }
      break;
    case "free_child":
      if (!config.freeChildren || config.freeChildren < 1) {
        throw new Error("Indica cuántos niños gratis (mínimo 1).");
      }
      break;
    case "second_passenger_discount":
      if (!config.percent || config.percent <= 0 || config.percent > 100) {
        throw new Error("Indica el porcentaje de descuento del segundo pasajero.");
      }
      if (config.passengerType !== "adult" && config.passengerType !== "child") {
        throw new Error("Selecciona si aplica al segundo adulto o niño.");
      }
      break;
    case "group_discount":
      if (!config.minPeople || config.minPeople < 2) {
        throw new Error("Indica el mínimo de personas (al menos 2).");
      }
      if (!config.percent || config.percent <= 0 || config.percent > 100) {
        throw new Error("Indica el porcentaje de descuento del grupo.");
      }
      break;
    case "early_booking":
      if (!config.minDaysAhead || config.minDaysAhead < 1) {
        throw new Error("Indica los días mínimos de anticipación.");
      }
      if (!config.percent || config.percent <= 0 || config.percent > 100) {
        throw new Error("Indica el porcentaje de descuento.");
      }
      break;
    default:
      throw new Error("Tipo de promoción no válido.");
  }
}

export async function listPromotions(options: { activeOnly?: boolean } = {}): Promise<PromotionRecord[]> {
  const where = options.activeOnly ? "WHERE is_active = TRUE" : "";
  const rows = await query<PromotionRow>(
    `SELECT * FROM promotions ${where} ORDER BY sort_order ASC, name ASC`,
  );
  return rows.map(mapPromotion);
}

export async function getPromotionById(id: string): Promise<PromotionRecord | null> {
  const rows = await query<PromotionRow>("SELECT * FROM promotions WHERE id = $1", [id]);
  return rows[0] ? mapPromotion(rows[0]) : null;
}

export async function getPromotionsByIds(ids: string[]): Promise<PromotionRecord[]> {
  if (!ids.length) {
    return [];
  }
  const rows = await query<PromotionRow>("SELECT * FROM promotions WHERE id = ANY($1::uuid[])", [ids]);
  const byId = new Map(rows.map((row) => [row.id, mapPromotion(row)]));
  return ids.map((id) => byId.get(id)).filter((p): p is PromotionRecord => Boolean(p));
}

export async function createPromotion(input: CreatePromotionInput): Promise<PromotionRecord> {
  if (!VALID_TYPES.has(input.promotionType)) {
    throw new Error("Tipo de promoción no válido.");
  }
  validateConfig(input.promotionType, input.config);

  const baseSlug = slugify(input.slug?.trim() || input.name);
  const slug = await ensureUniqueSlug(baseSlug, async (candidate) => {
    const rows = await query<{ id: string }>("SELECT id FROM promotions WHERE slug = $1", [
      candidate,
    ]);
    return rows.length > 0;
  });

  const rows = await query<PromotionRow>(
    `INSERT INTO promotions (
      name, slug, description, promotion_type, config, tour_ids,
      valid_from, valid_until, is_active, sort_order
    ) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10)
    RETURNING *`,
    [
      input.name.trim(),
      slug,
      input.description?.trim() || null,
      input.promotionType,
      JSON.stringify(input.config),
      input.tourIds?.length ? input.tourIds : null,
      input.validFrom ?? null,
      input.validUntil ?? null,
      input.isActive !== false,
      input.sortOrder ?? 0,
    ],
  );

  if (!rows[0]) {
    throw new Error("No fue posible crear la promoción.");
  }
  return mapPromotion(rows[0]);
}

export async function updatePromotion(id: string, input: UpdatePromotionInput): Promise<PromotionRecord> {
  const current = await getPromotionById(id);
  if (!current) {
    throw new Error("Promoción no encontrada.");
  }

  const promotionType = input.promotionType ?? current.promotionType;
  const config = input.config ?? current.config;
  validateConfig(promotionType, config);

  const rows = await query<PromotionRow>(
    `UPDATE promotions SET
      name = $2,
      description = $3,
      promotion_type = $4,
      config = $5::jsonb,
      tour_ids = $6,
      valid_from = $7,
      valid_until = $8,
      is_active = $9,
      sort_order = $10,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [
      id,
      input.name?.trim() ?? current.name,
      input.description !== undefined ? input.description?.trim() || null : current.description,
      promotionType,
      JSON.stringify(config),
      input.tourIds !== undefined ? (input.tourIds?.length ? input.tourIds : null) : current.tourIds,
      input.validFrom !== undefined ? input.validFrom : current.validFrom,
      input.validUntil !== undefined ? input.validUntil : current.validUntil,
      input.isActive ?? current.isActive,
      input.sortOrder ?? current.sortOrder,
    ],
  );

  if (!rows[0]) {
    throw new Error("Promoción no encontrada.");
  }
  return mapPromotion(rows[0]);
}

export async function deletePromotion(id: string) {
  const result = await query("DELETE FROM promotions WHERE id = $1 RETURNING id", [id]);
  if (!result.length) {
    throw new Error("Promoción no encontrada.");
  }
}
