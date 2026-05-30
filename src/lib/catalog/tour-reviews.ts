import { randomBytes } from "node:crypto";
import { query } from "@/lib/db";

export type TourReviewRecord = {
  id: string;
  bookingId: string;
  tourId: string | null;
  bookingCode: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type PublicTourReview = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type TourReviewStats = {
  averageRating: number;
  reviewCount: number;
};

type ReviewRow = {
  id: string;
  booking_id: string;
  tour_id: string | null;
  booking_code: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: Date;
};

function mapReview(row: ReviewRow): TourReviewRecord {
  return {
    id: row.id,
    bookingId: row.booking_id,
    tourId: row.tour_id,
    bookingCode: row.booking_code,
    customerName: row.customer_name,
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at.toISOString(),
  };
}

function displayCustomerName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0];
  return first || "Viajero";
}

function createToken(): string {
  return randomBytes(24).toString("hex");
}

export async function ensureReviewToken(bookingId: string): Promise<string> {
  const existing = await query<{ token: string; expires_at: Date }>(
    "SELECT token, expires_at FROM booking_review_tokens WHERE booking_id = $1",
    [bookingId],
  );

  if (existing[0] && existing[0].expires_at.getTime() > Date.now()) {
    return existing[0].token;
  }

  const token = createToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await query(
    `INSERT INTO booking_review_tokens (booking_id, token, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (booking_id) DO UPDATE SET
       token = EXCLUDED.token,
       expires_at = EXCLUDED.expires_at,
       created_at = NOW()`,
    [bookingId, token, expiresAt.toISOString()],
  );

  return token;
}

export type ReviewInviteDetails = {
  token: string;
  bookingId: string;
  bookingCode: string;
  customerName: string;
  tourName: string;
  tourId: string | null;
  tourSlug: string | null;
  alreadyReviewed: boolean;
  expired: boolean;
};

export async function getReviewInviteByToken(token: string): Promise<ReviewInviteDetails | null> {
  const rows = await query<{
    token: string;
    expires_at: Date;
    booking_id: string;
    booking_code: string;
    customer_name: string;
    tour_name: string;
    tour_id: string | null;
    tour_slug: string | null;
    review_id: string | null;
  }>(
    `SELECT
      brt.token,
      brt.expires_at,
      b.id AS booking_id,
      b.booking_code,
      b.customer_name,
      b.tour_name,
      b.tour_id,
      t.slug AS tour_slug,
      tr.id AS review_id
     FROM booking_review_tokens brt
     INNER JOIN bookings b ON b.id = brt.booking_id
     LEFT JOIN tours t ON t.id = b.tour_id
     LEFT JOIN tour_reviews tr ON tr.booking_id = b.id
     WHERE brt.token = $1`,
    [token.trim()],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    token: row.token,
    bookingId: row.booking_id,
    bookingCode: row.booking_code,
    customerName: row.customer_name,
    tourName: row.tour_name,
    tourId: row.tour_id,
    tourSlug: row.tour_slug,
    alreadyReviewed: Boolean(row.review_id),
    expired: row.expires_at.getTime() < Date.now(),
  };
}

export async function submitTourReview(input: {
  token: string;
  rating: number;
  comment: string;
}): Promise<TourReviewRecord> {
  const rating = Math.round(input.rating);
  const comment = input.comment.trim();

  if (rating < 1 || rating > 5) {
    throw new Error("Selecciona una calificación de 1 a 5 estrellas.");
  }
  if (comment.length < 10) {
    throw new Error("Escribe al menos 10 caracteres en tu reseña.");
  }
  if (comment.length > 2000) {
    throw new Error("La reseña es demasiado larga (máximo 2000 caracteres).");
  }

  const invite = await getReviewInviteByToken(input.token);
  if (!invite) {
    throw new Error("Enlace de reseña no válido.");
  }
  if (invite.expired) {
    throw new Error("Este enlace de reseña ha expirado.");
  }
  if (invite.alreadyReviewed) {
    throw new Error("Ya enviaste una reseña para esta reserva.");
  }

  const rows = await query<ReviewRow>(
    `INSERT INTO tour_reviews (
      booking_id, tour_id, booking_code, customer_name, rating, comment
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      invite.bookingId,
      invite.tourId,
      invite.bookingCode,
      displayCustomerName(invite.customerName),
      rating,
      comment,
    ],
  );

  const review = rows[0];
  if (!review) {
    throw new Error("No fue posible guardar la reseña.");
  }

  const tourId = review.tour_id;
  if (tourId) {
    await syncTourRatingFromReviews(tourId);
  }

  return mapReview(review);
}

export async function syncTourRatingFromReviews(tourId: string): Promise<void> {
  const stats = await query<{ avg_rating: string; review_count: string }>(
    `SELECT
      COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS avg_rating,
      COUNT(*)::text AS review_count
     FROM tour_reviews
     WHERE tour_id = $1 AND is_published = TRUE`,
    [tourId],
  );

  const row = stats[0];
  if (!row || Number(row.review_count) === 0) {
    return;
  }

  await query(
    `UPDATE tours SET
      rating = $2,
      reviews_count = $3,
      updated_at = NOW()
     WHERE id = $1`,
    [tourId, Number(row.avg_rating), Number(row.review_count)],
  );
}

export async function getTourReviewStats(tourId: string): Promise<TourReviewStats | null> {
  const rows = await query<{ avg_rating: string; review_count: string }>(
    `SELECT
      ROUND(AVG(rating)::numeric, 2) AS avg_rating,
      COUNT(*)::text AS review_count
     FROM tour_reviews
     WHERE tour_id = $1 AND is_published = TRUE`,
    [tourId],
  );

  const row = rows[0];
  const count = Number(row?.review_count ?? 0);
  if (!row || count === 0) {
    return null;
  }

  return {
    averageRating: Number(row.avg_rating),
    reviewCount: count,
  };
}

export async function getTourReviewStatsBySlug(slug: string): Promise<TourReviewStats | null> {
  const tours = await query<{ id: string }>("SELECT id FROM tours WHERE slug = $1 AND is_active = TRUE", [
    slug,
  ]);
  const tourId = tours[0]?.id;
  if (!tourId) {
    return null;
  }
  return getTourReviewStats(tourId);
}

export async function listPublicReviewsForTourSlug(
  slug: string,
  limit = 12,
): Promise<PublicTourReview[]> {
  const rows = await query<ReviewRow>(
    `SELECT tr.*
     FROM tour_reviews tr
     INNER JOIN tours t ON t.id = tr.tour_id
     WHERE t.slug = $1 AND tr.is_published = TRUE
     ORDER BY tr.created_at DESC
     LIMIT $2`,
    [slug, limit],
  );

  return rows.map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at.toISOString(),
  }));
}

/** Mejores reseñas primero (más estrellas) para convencer en la ficha del tour. */
export async function listTopPublicReviewsForTourSlug(
  slug: string,
  options: { limit?: number; minRating?: number } = {},
): Promise<PublicTourReview[]> {
  const limit = options.limit ?? 6;
  const minRating = options.minRating ?? 4;

  const rows = await query<ReviewRow>(
    `SELECT tr.*
     FROM tour_reviews tr
     INNER JOIN tours t ON t.id = tr.tour_id
     WHERE t.slug = $1 AND tr.is_published = TRUE AND tr.rating >= $2
     ORDER BY tr.rating DESC, LENGTH(tr.comment) DESC, tr.created_at DESC
     LIMIT $3`,
    [slug, minRating, limit],
  );

  return rows.map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function hasTourReview(bookingId: string): Promise<boolean> {
  const rows = await query<{ id: string }>("SELECT id FROM tour_reviews WHERE booking_id = $1", [
    bookingId,
  ]);
  return rows.length > 0;
}

export type BookingDueForReview = {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  tourName: string;
  tourId: string | null;
  checkinAt: string;
};

export async function listBookingsDueForReviewRequest(
  hoursAfterCheckin: number,
): Promise<BookingDueForReview[]> {
  const rows = await query<{
    id: string;
    booking_code: string;
    customer_name: string;
    customer_phone: string;
    tour_name: string;
    tour_id: string | null;
    checkin_at: Date;
  }>(
    `SELECT b.id, b.booking_code, b.customer_name, b.customer_phone, b.tour_name, b.tour_id, b.checkin_at
     FROM bookings b
     WHERE b.approval_status = 'confirmed'
       AND b.customer_phone IS NOT NULL
       AND TRIM(b.customer_phone) <> ''
       AND b.checkin_at + ($1::text || ' hours')::interval <= NOW()
       AND NOT EXISTS (
         SELECT 1 FROM whatsapp_message_log wml
         WHERE wml.booking_id = b.id
           AND wml.template_key = 'post_experience_review'
           AND wml.status = 'sent'
       )
       AND NOT EXISTS (SELECT 1 FROM tour_reviews tr WHERE tr.booking_id = b.id)
     ORDER BY b.checkin_at ASC
     LIMIT 50`,
    [String(hoursAfterCheckin)],
  );

  return rows.map((row) => ({
    id: row.id,
    bookingCode: row.booking_code,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    tourName: row.tour_name,
    tourId: row.tour_id,
    checkinAt: row.checkin_at.toISOString(),
  }));
}
