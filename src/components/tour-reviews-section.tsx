import type { PublicTourReview } from "@/lib/catalog/tour-reviews";

type TourReviewsSectionProps = {
  reviews: PublicTourReview[];
  averageRating: number;
  reviewCount: number;
};

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    month: "short",
    year: "numeric",
  });
}

function reviewCountLabel(count: number) {
  return count === 1 ? "1 reseña" : `${count} reseñas`;
}

function StarRow({ rating, size = "lg" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const iconClass =
    size === "sm" ? "text-[18px]" : size === "md" ? "text-[20px]" : "text-[22px]";

  return (
    <div className="flex gap-0.5 text-secondary" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < rating;
        return (
          <span
            key={index}
            className={`material-symbols-outlined ${iconClass} leading-none ${
              filled ? "[font-variation-settings:'FILL'_1]" : "text-secondary/35"
            }`}
          >
            star
          </span>
        );
      })}
    </div>
  );
}

function ReviewCard({
  review,
  featured = false,
}: {
  review: PublicTourReview;
  featured?: boolean;
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-[1.75rem] border bg-white p-6 md:p-7 coastal-shadow transition-shadow hover:shadow-md ${
        featured
          ? "border-secondary/30 bg-gradient-to-br from-secondary-container/20 via-white to-white md:col-span-2"
          : "border-outline-variant/15"
      }`}
    >
      {review.rating >= 5 ? (
        <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1.5 text-xs font-bold text-on-secondary-container shadow-sm">
          <span className="material-symbols-outlined text-sm [font-variation-settings:'FILL'_1]">star</span>
          Top
        </span>
      ) : null}

      <div className="mb-5 flex flex-wrap items-center gap-4 pr-16">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-on-primary shadow-sm">
          {review.customerName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-primary">{review.customerName}</p>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            Viajero verificado · {formatReviewDate(review.createdAt)}
          </p>
        </div>
        <div className="shrink-0">
          <StarRow rating={review.rating} size={featured ? "lg" : "md"} />
        </div>
      </div>

      <blockquote
        className={`border-l-4 border-secondary/50 pl-4 leading-relaxed text-on-surface-variant ${
          featured ? "text-[17px] md:text-[19px]" : "text-[15px] md:text-[16px]"
        }`}
      >
        &ldquo;{review.comment}&rdquo;
      </blockquote>
    </article>
  );
}

export function TourReviewsSection({ reviews, averageRating, reviewCount }: TourReviewsSectionProps) {
  if (reviews.length === 0) {
    return null;
  }

  const [featured, ...rest] = reviews;
  const fiveStarCount = reviews.filter((r) => r.rating >= 5).length;
  const roundedRating = Math.round(averageRating);

  return (
    <section className="mt-14 scroll-mt-28 md:mt-16" id="resenas">
      <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary to-tertiary-container p-8 text-on-primary md:mb-10 md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary-container/90">
              Confianza de viajeros reales
            </p>
            <h3 className="text-[26px] font-extrabold leading-tight tracking-tight md:text-[34px]">
              Lo que dicen quienes ya vivieron la experiencia
            </h3>
            <p className="text-sm leading-relaxed text-on-primary/80 md:text-[15px]">
              Reseñas verificadas con su número de reserva. Las mejores calificaciones aparecen primero.
            </p>
          </div>

          <div className="flex shrink-0 items-stretch gap-5 rounded-2xl border border-white/15 bg-white/10 px-6 py-5 backdrop-blur-sm md:px-8">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-[42px] font-extrabold leading-none text-secondary-container md:text-5xl">
                {averageRating.toFixed(1)}
              </p>
              <StarRow rating={roundedRating} size="md" />
            </div>
            <div className="w-px self-stretch bg-white/20" aria-hidden />
            <div className="flex flex-col justify-center gap-1 text-sm">
              <p className="font-semibold">{reviewCountLabel(reviewCount)}</p>
              {fiveStarCount > 0 ? (
                <p className="text-on-primary/75">
                  {fiveStarCount === 1 ? "1 con 5 estrellas" : `${fiveStarCount} con 5 estrellas`}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        <ReviewCard review={featured} featured />
        {rest.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

export function BookingTopReviews({
  reviews,
  averageRating,
  reviewCount,
}: {
  reviews: PublicTourReview[];
  averageRating: number;
  reviewCount: number;
}) {
  const top = reviews.slice(0, 3);
  if (top.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-outline-variant/20 pt-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-primary">Viajeros recomiendan</p>
        <span className="rounded-full bg-secondary-container/30 px-2.5 py-1 text-xs font-bold text-primary">
          {averageRating.toFixed(1)} ★ · {reviewCountLabel(reviewCount)}
        </span>
      </div>
      <ul className="space-y-3">
        {top.map((review) => (
          <li key={review.id} className="rounded-xl bg-surface-container-low p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-primary">{review.customerName}</span>
              <StarRow rating={review.rating} size="sm" />
            </div>
            <p className="line-clamp-2 text-xs leading-5 text-on-surface-variant">
              &ldquo;{review.comment}&rdquo;
            </p>
          </li>
        ))}
      </ul>
      <a href="#resenas" className="mt-4 block text-center text-xs font-semibold text-primary hover:underline">
        Ver todas las reseñas
      </a>
    </div>
  );
}
