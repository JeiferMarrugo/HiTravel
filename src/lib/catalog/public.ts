import { amountFromStorage } from "@/lib/catalog/money";
import {
  getTourReviewStats,
  getTourReviewStatsBySlug,
  listTopPublicReviewsForTourSlug,
  type PublicTourReview,
} from "@/lib/catalog/tour-reviews";
import { listActiveTourRecords, getTourBySlug } from "@/lib/catalog/tours";
import type { TourRecord } from "@/lib/catalog/types";

export type { PublicTourReview };

export type PublicTour = {
  slug: string;
  name: string;
  category: string;
  badge?: string;
  country: string;
  description: string;
  longDescription: string[];
  price: number;
  priceFromCents: number;
  currency: string;
  rating: number;
  reviews: number;
  topGuestReviews: PublicTourReview[];
  duration: string;
  groupSize: string;
  languages: string;
  location: string;
  heroImage: string;
  gallery: string[];
  includes: string[];
  excludes: string[];
  itinerary: Array<{
    time: string;
    title: string;
    description: string;
    featured?: boolean;
  }>;
};

const PLACEHOLDER_HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD2mrCNHLm92LxkC22dS9fOjVqeIDFI3MAUStYJc-XuouBbkEGyMvuv7_eEKZa8qp7uKlVG2aSQ3gEOVBeSpJ74dVv113T0AjP9XgGPYrhjsjdTXU6s0igcwsdplryr0LFn0K_rHqktHyu0M4kE4dAmFeN7fQI4cRnzsXBE9fEGnh_LIAYk7Z1RT-YYmZRjgsA_z9SIhBMwLszcnR1y7nWHvAgRn07hkt9or8cI678jcQaEUri3ktbQZ9LRBmaTw1xEJ970T6SS_w";

export function isUploadedImage(url: string) {
  return url.startsWith("/uploads");
}

async function mapToPublicTour(record: TourRecord): Promise<PublicTour> {
  const reviewStats = record.id ? await getTourReviewStats(record.id) : null;
  let topGuestReviews = await listTopPublicReviewsForTourSlug(record.slug, {
    limit: 6,
    minRating: 4,
  });
  if (topGuestReviews.length === 0) {
    topGuestReviews = await listTopPublicReviewsForTourSlug(record.slug, {
      limit: 6,
      minRating: 1,
    });
  }
  const rating = reviewStats?.averageRating ?? record.rating;
  const reviews = reviewStats?.reviewCount ?? record.reviewsCount;
  const gallery =
    record.gallery.length > 0
      ? record.gallery
      : record.heroImageUrl
        ? [record.heroImageUrl]
        : [];

  const heroImage = record.heroImageUrl ?? gallery[0] ?? PLACEHOLDER_HERO;

  return {
    slug: record.slug,
    name: record.name,
    category: record.categoryName ?? record.packageType,
    badge: record.badge ?? undefined,
    country: record.country,
    description: record.shortDescription || record.description,
    longDescription:
      record.longDescription.length > 0
        ? record.longDescription
        : record.description
          ? [record.description]
          : [],
    price: amountFromStorage(record.priceFromCents, record.currency),
    priceFromCents: record.priceFromCents,
    currency: record.currency,
    rating,
    reviews,
    topGuestReviews,
    duration: record.durationLabel,
    groupSize: record.groupSizeLabel,
    languages: record.languages,
    location: record.location,
    heroImage,
    gallery: gallery.length > 0 ? gallery : [heroImage],
    includes: record.includes,
    excludes: record.excludes,
    itinerary: record.itinerary.map((step) => ({
      time: step.time,
      title: step.title,
      description: step.description,
      featured: step.featured,
    })),
  };
}

/** Experiencias publicadas en el panel (is_active = true), ordenadas para el sitio. */
export async function getPublicTours(): Promise<PublicTour[]> {
  const records = await listActiveTourRecords();
  return Promise.all(records.map(mapToPublicTour));
}

/** Destacadas en inicio; si hay pocas, completa con otras activas del panel. */
export async function getFeaturedPublicTours(limit = 3): Promise<PublicTour[]> {
  const records = await listActiveTourRecords();
  const picked: TourRecord[] = [];
  const seen = new Set<string>();

  for (const record of records) {
    if (record.isFeatured && picked.length < limit) {
      picked.push(record);
      seen.add(record.id);
    }
  }

  for (const record of records) {
    if (picked.length >= limit) {
      break;
    }
    if (!seen.has(record.id)) {
      picked.push(record);
      seen.add(record.id);
    }
  }

  return Promise.all(picked.slice(0, limit).map(mapToPublicTour));
}

export async function getPublicTourBySlug(slug: string): Promise<PublicTour | null> {
  const record = await getTourBySlug(slug);
  if (!record || !record.isActive) {
    return null;
  }
  return mapToPublicTour(record);
}

export async function getPublicTourReviewStatsBySlug(slug: string) {
  return getTourReviewStatsBySlug(slug);
}

export async function getPublicTourSlugs(): Promise<string[]> {
  const records = await listActiveTourRecords();
  return records.map((record) => record.slug);
}
