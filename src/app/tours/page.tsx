import { TourCard } from "@/components/tour-card";
import { ToursFilters } from "@/components/tours-filters";
import { TOURS_PAGE_SIZE, ToursPagination } from "@/components/tours-pagination";
import { TopNav, ToursFooter, WhatsappFab } from "@/components/site-chrome";
import { getPublicTours } from "@/lib/catalog/public";
import { PUBLIC_PAGE_SHELL } from "@/lib/public-page-layout";
import { getVisitorPricingContext } from "@/lib/pricing/visitor-currency";
import {
  filterPublicTours,
  formatFilterPrice,
  getTourPriceBounds,
} from "@/lib/tours/filter-tours";
import { parseCategoryParam, parseMaxPriceParam } from "@/lib/tours/tours-url";

export const dynamic = "force-dynamic";

type ToursPageProps = {
  searchParams?: Promise<{
    adultos?: string;
    categoria?: string;
    destino?: string;
    fecha?: string;
    ninos?: string;
    page?: string;
    precioMax?: string;
  }>;
};

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = (await searchParams) ?? {};
  const { content, displayCurrency, usdCopRate } = await getVisitorPricingContext();
  const tours = await getPublicTours();
  const { toursPage } = content;
  const destinationFilter = params.destino?.trim() ?? "";
  const selectedCategories = parseCategoryParam(params.categoria);
  const maxPrice = parseMaxPriceParam(params.precioMax);
  const adults = Number(params.adultos ?? "0");
  const children = Number(params.ninos ?? "0");
  const passengerSummary = [
    adults > 0 ? `${adults} adulto${adults === 1 ? "" : "s"}` : null,
    children > 0 ? `${children} niño${children === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const categories = [...new Set(tours.map((tour) => tour.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
  const priceBounds = getTourPriceBounds(tours, displayCurrency, usdCopRate);

  const filteredTours = filterPublicTours(
    tours,
    {
      destination: destinationFilter,
      categories: selectedCategories,
      maxPrice,
    },
    displayCurrency,
    usdCopRate,
  );

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / TOURS_PAGE_SIZE));
  const requestedPage = Math.max(1, Number(params.page ?? "1") || 1);
  const currentPage = Math.min(requestedPage, totalPages);
  const pageOffset = (currentPage - 1) * TOURS_PAGE_SIZE;
  const paginatedTours = filteredTours.slice(pageOffset, pageOffset + TOURS_PAGE_SIZE);

  const paginationParams = {
    destino: params.destino,
    adultos: params.adultos,
    ninos: params.ninos,
    fecha: params.fecha,
    categoria: params.categoria,
    precioMax: params.precioMax,
  };

  const activeFilterBadges = [
    destinationFilter ? `Destino: ${destinationFilter}` : null,
    selectedCategories.length ? `Categoría: ${selectedCategories.join(", ")}` : null,
    maxPrice !== null ? `Hasta ${formatFilterPrice(maxPrice, displayCurrency)}` : null,
    passengerSummary ? `Pasajeros: ${passengerSummary}` : null,
  ].filter(Boolean);

  return (
    <>
      <TopNav content={content} active="tours" displayCurrency={displayCurrency} />

      <main className={`${PUBLIC_PAGE_SHELL} pb-20 pt-24`}>
        <header className="mb-12">
          <h1 className="mb-4 text-[36px] font-extrabold leading-[44px] text-primary md:text-[48px] md:leading-[56px]">
            Descubre tu próxima aventura
          </h1>
          <p className="max-w-3xl text-lg leading-7 text-on-surface-variant">
            Desde las aguas cristalinas de Barú hasta los senderos de Tayrona, explora el Caribe como nunca antes.
          </p>
          {activeFilterBadges.length ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {activeFilterBadges.map((badge) => (
                <div
                  key={badge}
                  className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-primary"
                >
                  {badge}
                </div>
              ))}
            </div>
          ) : null}
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-72 xl:w-80">
            <ToursFilters
              categories={categories}
              priceMin={priceBounds.min}
              priceMax={priceBounds.max}
              displayCurrency={displayCurrency}
            />
          </aside>

          <div className="min-w-0 flex-1">
            {paginatedTours.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedTours.map((tour) => (
                  <TourCard
                    key={tour.slug}
                    tour={tour}
                    displayCurrency={displayCurrency}
                    usdCopRate={usdCopRate}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] bg-white p-10 text-center coastal-shadow">
                <h2 className="text-[22px] font-semibold text-primary">
                  {tours.length ? toursPage.emptyWithToursTitle : toursPage.emptyCatalogTitle}
                </h2>
                <p className="mt-3 text-on-surface-variant">
                  {tours.length ? toursPage.emptyWithToursText : toursPage.emptyCatalogText}
                </p>
              </div>
            )}

            <ToursPagination
              currentPage={currentPage}
              totalPages={totalPages}
              searchParams={paginationParams}
            />
          </div>
        </div>
      </main>

      <ToursFooter content={content} />
      <WhatsappFab content={content} />
    </>
  );
}
