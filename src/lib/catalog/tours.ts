import { query } from "@/lib/db";
import { ensureUniqueSlug, slugify } from "@/lib/catalog/slug";
import type {
  CreateTourInput,
  ItineraryItem,
  PackageType,
  PricingSeason,
  TourCategory,
  TourListItem,
  TourRecord,
  UpdateTourInput,
} from "@/lib/catalog/types";

type TourRow = {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  category_name: string | null;
  package_type: PackageType;
  badge: string | null;
  country: string;
  location: string;
  short_description: string;
  description: string;
  long_description: string[];
  price_from_cents: number;
  currency: string;
  rating: string;
  reviews_count: number;
  duration_label: string;
  group_size_label: string;
  languages: string;
  hero_image_url: string | null;
  gallery: string[];
  includes: string[];
  excludes: string[];
  highlights: string[];
  meeting_point: string | null;
  cancellation_policy: string | null;
  pricing_seasons: PricingSeason[];
  itinerary: ItineraryItem[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

function mapTour(row: TourRow): TourRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    packageType: row.package_type,
    badge: row.badge,
    country: row.country,
    location: row.location,
    shortDescription: row.short_description,
    description: row.description,
    longDescription: row.long_description ?? [],
    priceFromCents: row.price_from_cents,
    currency: row.currency,
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    durationLabel: row.duration_label,
    groupSizeLabel: row.group_size_label,
    languages: row.languages,
    heroImageUrl: row.hero_image_url,
    gallery: row.gallery ?? [],
    includes: row.includes ?? [],
    excludes: row.excludes ?? [],
    highlights: row.highlights ?? [],
    meetingPoint: row.meeting_point,
    cancellationPolicy: row.cancellation_policy,
    pricingSeasons: row.pricing_seasons ?? [],
    itinerary: row.itinerary ?? [],
    isActive: row.is_active,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const tourSelect = `
  SELECT t.*, c.name AS category_name
  FROM tours t
  LEFT JOIN tour_categories c ON c.id = t.category_id
`;

export async function getOrCreateCategoryId(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }

  const slug = slugify(trimmed);
  const rows = await query<{ id: string }>(
    `INSERT INTO tour_categories (slug, name)
     VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [slug, trimmed],
  );
  return rows[0]?.id ?? null;
}

export async function listTourCategories(): Promise<TourCategory[]> {
  const rows = await query<{
    id: string;
    slug: string;
    name: string;
    sort_order: number;
  }>("SELECT * FROM tour_categories ORDER BY sort_order ASC, name ASC");

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
  }));
}

export async function listActiveTourRecords(): Promise<TourRecord[]> {
  const rows = await query<TourRow>(
    `${tourSelect} WHERE t.is_active = TRUE ORDER BY t.is_featured DESC, t.sort_order ASC, t.name ASC`,
  );
  return rows.map(mapTour);
}

export async function listTours(options: { activeOnly?: boolean } = {}): Promise<TourListItem[]> {
  const where = options.activeOnly ? "WHERE t.is_active = TRUE" : "";
  const rows = await query<TourRow>(
    `${tourSelect} ${where} ORDER BY t.is_featured DESC, t.sort_order ASC, t.name ASC`,
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryName: row.category_name,
    packageType: row.package_type,
    shortDescription: row.short_description,
    priceFromCents: row.price_from_cents,
    currency: row.currency,
    durationLabel: row.duration_label,
    groupSizeLabel: row.group_size_label,
    location: row.location,
    rating: Number(row.rating),
    heroImageUrl: row.hero_image_url,
    isActive: row.is_active,
    isFeatured: row.is_featured,
  }));
}

export async function getTourById(id: string): Promise<TourRecord | null> {
  const rows = await query<TourRow>(`${tourSelect} WHERE t.id = $1`, [id]);
  return rows[0] ? mapTour(rows[0]) : null;
}

export async function getTourBySlug(slug: string): Promise<TourRecord | null> {
  const rows = await query<TourRow>(`${tourSelect} WHERE t.slug = $1`, [slug]);
  return rows[0] ? mapTour(rows[0]) : null;
}

async function slugExists(slug: string, excludeId?: string) {
  const rows = await query<{ id: string }>(
    excludeId
      ? "SELECT id FROM tours WHERE slug = $1 AND id <> $2 LIMIT 1"
      : "SELECT id FROM tours WHERE slug = $1 LIMIT 1",
    excludeId ? [slug, excludeId] : [slug],
  );
  return rows.length > 0;
}

export async function createTour(input: CreateTourInput): Promise<TourRecord> {
  const slug =
    input.slug?.trim() ||
    (await ensureUniqueSlug(input.name, (candidate) => slugExists(candidate)));

  const rows = await query<TourRow>(
    `INSERT INTO tours (
      slug, name, category_id, package_type, badge, country, location,
      short_description, description, long_description, price_from_cents, currency,
      rating, reviews_count, duration_label, group_size_label, languages,
      hero_image_url, gallery, includes, excludes, highlights,
      meeting_point, cancellation_policy, pricing_seasons, itinerary,
      is_active, is_featured, sort_order
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
    ) RETURNING *`,
    [
      slug,
      input.name.trim(),
      input.categoryId,
      input.packageType,
      input.badge,
      input.country.trim(),
      input.location.trim(),
      input.shortDescription.trim(),
      input.description.trim(),
      JSON.stringify(input.longDescription ?? []),
      input.priceFromCents,
      input.currency,
      input.rating,
      input.reviewsCount,
      input.durationLabel.trim(),
      input.groupSizeLabel.trim(),
      input.languages.trim(),
      input.heroImageUrl,
      JSON.stringify(input.gallery ?? []),
      JSON.stringify(input.includes ?? []),
      JSON.stringify(input.excludes ?? []),
      JSON.stringify(input.highlights ?? []),
      input.meetingPoint,
      input.cancellationPolicy,
      JSON.stringify(input.pricingSeasons ?? []),
      JSON.stringify(input.itinerary ?? []),
      input.isActive,
      input.isFeatured,
      input.sortOrder,
    ],
  );

  const created = await getTourById(rows[0].id);
  if (!created) {
    throw new Error("No fue posible crear el tour.");
  }
  return created;
}

export async function updateTour(id: string, input: UpdateTourInput): Promise<TourRecord> {
  const current = await getTourById(id);
  if (!current) {
    throw new Error("Tour no encontrado.");
  }

  let slug = current.slug;
  if (input.name && !input.slug) {
    slug = await ensureUniqueSlug(input.name, (candidate) => slugExists(candidate, id));
  } else if (input.slug) {
    const nextSlug = slugify(input.slug);
    if (await slugExists(nextSlug, id)) {
      throw new Error("Ese slug ya está en uso.");
    }
    slug = nextSlug;
  }

  await query(
    `UPDATE tours SET
      slug = $2, name = $3, category_id = $4, package_type = $5, badge = $6,
      country = $7, location = $8, short_description = $9, description = $10,
      long_description = $11, price_from_cents = $12, currency = $13,
      rating = $14, reviews_count = $15, duration_label = $16, group_size_label = $17,
      languages = $18, hero_image_url = $19, gallery = $20, includes = $21,
      excludes = $22, highlights = $23, meeting_point = $24, cancellation_policy = $25,
      pricing_seasons = $26, itinerary = $27, is_active = $28, is_featured = $29,
      sort_order = $30, updated_at = NOW()
    WHERE id = $1`,
    [
      id,
      slug,
      input.name ?? current.name,
      input.categoryId !== undefined ? input.categoryId : current.categoryId,
      input.packageType ?? current.packageType,
      input.badge !== undefined ? input.badge : current.badge,
      input.country ?? current.country,
      input.location ?? current.location,
      input.shortDescription ?? current.shortDescription,
      input.description ?? current.description,
      JSON.stringify(input.longDescription ?? current.longDescription),
      input.priceFromCents ?? current.priceFromCents,
      input.currency ?? current.currency,
      input.rating ?? current.rating,
      input.reviewsCount ?? current.reviewsCount,
      input.durationLabel ?? current.durationLabel,
      input.groupSizeLabel ?? current.groupSizeLabel,
      input.languages ?? current.languages,
      input.heroImageUrl !== undefined ? input.heroImageUrl : current.heroImageUrl,
      JSON.stringify(input.gallery ?? current.gallery),
      JSON.stringify(input.includes ?? current.includes),
      JSON.stringify(input.excludes ?? current.excludes),
      JSON.stringify(input.highlights ?? current.highlights),
      input.meetingPoint !== undefined ? input.meetingPoint : current.meetingPoint,
      input.cancellationPolicy !== undefined ? input.cancellationPolicy : current.cancellationPolicy,
      JSON.stringify(input.pricingSeasons ?? current.pricingSeasons),
      JSON.stringify(input.itinerary ?? current.itinerary),
      input.isActive ?? current.isActive,
      input.isFeatured ?? current.isFeatured,
      input.sortOrder ?? current.sortOrder,
    ],
  );

  const updated = await getTourById(id);
  if (!updated) {
    throw new Error("No fue posible actualizar el tour.");
  }
  return updated;
}

export async function deleteTour(id: string) {
  await query("DELETE FROM tours WHERE id = $1", [id]);
}
