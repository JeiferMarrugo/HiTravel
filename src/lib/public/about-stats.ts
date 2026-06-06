import { query } from "@/lib/db";
import type { SiteStat } from "@/lib/site-content/types";

export type AboutPageLiveStats = {
  averageRating: number;
  reviewCount: number;
  travelersServed: number;
  whatsappMessagesSent: number;
};

export async function getAboutPageLiveStats(): Promise<AboutPageLiveStats> {
  const [reviewRows, travelerRows, whatsappRows] = await Promise.all([
    query<{ avg_rating: string | null; review_count: string }>(`
      SELECT
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::text AS avg_rating,
        COUNT(*)::text AS review_count
      FROM tour_reviews
      WHERE is_published = TRUE
    `),
    query<{ travelers_served: string }>(`
      SELECT COALESCE(SUM(adults + children), 0)::text AS travelers_served
      FROM bookings
      WHERE approval_status = 'confirmed'
    `),
    query<{ total: string }>(`
      SELECT COUNT(*)::text AS total
      FROM whatsapp_message_log
      WHERE status = 'sent'
    `),
  ]);

  const reviewCount = Number(reviewRows[0]?.review_count ?? 0);

  return {
    averageRating: reviewCount > 0 ? Number(reviewRows[0]?.avg_rating ?? 0) : 0,
    reviewCount,
    travelersServed: Number(travelerRows[0]?.travelers_served ?? 0),
    whatsappMessagesSent: Number(whatsappRows[0]?.total ?? 0),
  };
}

function formatRatingValue(rating: number) {
  return `${rating.toFixed(1).replace(".", ",")}/5`;
}

function formatTravelersValue(count: number) {
  if (count <= 0) {
    return "0";
  }

  return `+${count.toLocaleString("es-CO")}`;
}

function formatCountValue(count: number) {
  if (count <= 0) {
    return "0";
  }

  return count.toLocaleString("es-CO");
}

export function formatAboutStats(live: AboutPageLiveStats, labels: SiteStat[]): SiteStat[] {
  return [
    {
      label: labels[0]?.label ?? "calificación promedio",
      value: formatRatingValue(live.averageRating),
    },
    {
      label: labels[1]?.label ?? "viajeros atendidos",
      value: formatTravelersValue(live.travelersServed),
    },
    {
      label: labels[2]?.label ?? "soporte por WhatsApp",
      value: formatCountValue(live.whatsappMessagesSent),
    },
  ];
}
