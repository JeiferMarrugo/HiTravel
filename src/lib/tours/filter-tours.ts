import { amountFromStorage } from "@/lib/catalog/money";
import type { PublicTour } from "@/lib/catalog/public";
import { convertForDisplay, type DisplayCurrency } from "@/lib/pricing/display-currency";

export function getTourDisplayPrice(
  tour: PublicTour,
  displayCurrency: DisplayCurrency,
  usdCopRate: number,
) {
  const converted = convertForDisplay(tour.priceFromCents, tour.currency, displayCurrency, usdCopRate);
  return amountFromStorage(converted.amountMinor, converted.currency);
}

export function getTourPriceBounds(
  tours: PublicTour[],
  displayCurrency: DisplayCurrency,
  usdCopRate: number,
) {
  if (!tours.length) {
    return { min: 0, max: 0 };
  }

  const prices = tours.map((tour) => getTourDisplayPrice(tour, displayCurrency, usdCopRate));
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

type FilterToursInput = {
  destination?: string;
  categories?: string[];
  maxPrice?: number | null;
};

export function filterPublicTours(
  tours: PublicTour[],
  filters: FilterToursInput,
  displayCurrency: DisplayCurrency,
  usdCopRate: number,
) {
  const destination = filters.destination?.trim() ?? "";
  const categories = filters.categories ?? [];
  const maxPrice = filters.maxPrice ?? null;

  return tours.filter((tour) => {
    if (destination) {
      const needle = destination.toLowerCase();
      const matchesDestination =
        tour.country.toLowerCase().includes(needle) || tour.location.toLowerCase().includes(needle);
      if (!matchesDestination) {
        return false;
      }
    }

    if (categories.length > 0 && !categories.includes(tour.category)) {
      return false;
    }

    if (maxPrice !== null) {
      const price = getTourDisplayPrice(tour, displayCurrency, usdCopRate);
      if (price > maxPrice) {
        return false;
      }
    }

    return true;
  });
}

export function formatFilterPrice(amount: number, displayCurrency: DisplayCurrency) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: displayCurrency,
    maximumFractionDigits: displayCurrency === "USD" ? 0 : 0,
  }).format(amount);
}
