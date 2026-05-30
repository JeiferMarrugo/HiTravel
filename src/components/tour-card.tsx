import Image from "next/image";
import Link from "next/link";
import { formatVisitorPrice } from "@/lib/pricing/visitor-currency";
import type { DisplayCurrency } from "@/lib/pricing/visitor-currency";
import { isUploadedImage, type PublicTour } from "@/lib/catalog/public";

type TourCardProps = {
  tour: PublicTour;
  displayCurrency: DisplayCurrency;
  usdCopRate: number;
};

export function TourCard({ tour, displayCurrency, usdCopRate }: TourCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl bg-surface-container-lowest coastal-mist-shadow transition-transform duration-300 hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={tour.heroImage}
          alt={tour.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 1024px) 100vw, 33vw"
          unoptimized={isUploadedImage(tour.heroImage)}
        />
        <div className="absolute right-4 top-4 rounded-full bg-secondary-container px-3 py-1 text-sm font-semibold text-on-secondary-container shadow-sm">
          {formatVisitorPrice(tour.priceFromCents, tour.currency, displayCurrency, usdCopRate)}
        </div>
        {tour.badge ? (
          <div className="absolute bottom-4 left-4">
            <span className="rounded-full bg-tertiary-container/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-tertiary-container backdrop-blur-md">
              {tour.badge}
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-6">
        <div>
          <h3 className="mb-2 text-[22px] font-semibold text-primary">{tour.name}</h3>
          <p className="mb-6 line-clamp-2 text-base leading-6 text-on-surface-variant">{tour.description}</p>
        </div>

        <div className="mb-6 flex items-center justify-between text-sm text-on-surface-variant">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              <span>{tour.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">star</span>
              <span>
                {tour.rating.toFixed(1)} ({tour.reviews} reseñas)
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/tours/${tour.slug}`}
          className="block w-full rounded-lg border-2 border-primary-container py-4 text-center text-sm font-semibold text-primary-container transition-all hover:bg-primary-container hover:text-white"
        >
          Ver más
        </Link>
      </div>
    </article>
  );
}
