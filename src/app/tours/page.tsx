import { TourCard } from "@/components/tour-card";
import { TopNav, ToursFooter, WhatsappFab } from "@/components/site-chrome";
import { tours } from "@/lib/site-data";

const categories = ["Todos los tours", "Playa y mar", "Historia y cultura", "Aventura y naturaleza"];

type ToursPageProps = {
  searchParams?: Promise<{
    adultos?: string;
    destino?: string;
    fecha?: string;
    ninos?: string;
  }>;
};

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = (await searchParams) ?? {};
  const destinationFilter = params.destino?.trim() ?? "";
  const adults = Number(params.adultos ?? "0");
  const children = Number(params.ninos ?? "0");
  const passengerSummary = [adults > 0 ? `${adults} adulto${adults === 1 ? "" : "s"}` : null, children > 0 ? `${children} niño${children === 1 ? "" : "s"}` : null]
    .filter(Boolean)
    .join(", ");
  const orderedTours = [tours[3], tours[1], tours[2], tours[0]];
  const filteredTours = destinationFilter
    ? orderedTours.filter(
        (tour) =>
          tour.country.toLowerCase().includes(destinationFilter.toLowerCase()) ||
          tour.location.toLowerCase().includes(destinationFilter.toLowerCase()),
      )
    : orderedTours;

  return (
    <>
      <TopNav active="tours" />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 md:px-16">
        <header className="mb-12">
          <h1 className="mb-4 text-[36px] font-extrabold leading-[44px] text-primary md:text-[48px] md:leading-[56px]">
            Descubre tu próxima aventura
          </h1>
          <p className="max-w-2xl text-lg leading-7 text-on-surface-variant">
            Desde las aguas cristalinas de Barú hasta los senderos de Tayrona, explora el Caribe como nunca antes.
          </p>
          {destinationFilter || passengerSummary ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {destinationFilter ? (
                <div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-primary">
                  Filtrando por destino: {destinationFilter}
                </div>
              ) : null}
              {passengerSummary ? (
                <div className="inline-flex rounded-full bg-secondary-container/40 px-4 py-2 text-sm font-medium text-primary">
                  Pasajeros: {passengerSummary}
                </div>
              ) : null}
            </div>
          ) : null}
        </header>

        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="w-full flex-shrink-0 md:w-64">
            <div className="coastal-mist-shadow sticky top-28 rounded-xl bg-surface-container-low p-6">
              <h3 className="mb-6 text-[22px] font-semibold text-primary">Filtros</h3>

              <div className="mb-8">
                <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.2em] text-outline">Categoría</span>
                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <label key={category} className="group flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={index === 0}
                        className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-base text-on-surface-variant group-hover:text-primary">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.2em] text-outline">Rango de precio</span>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  defaultValue="500"
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-variant accent-primary"
                />
                <div className="mt-2 flex justify-between">
                  <span className="text-sm text-on-surface-variant">$0</span>
                  <span className="text-sm text-on-surface-variant">$1.000+</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-variant"
              >
                Limpiar filtros
              </button>
            </div>
          </aside>

          <div className="flex-grow">
            {filteredTours.length ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredTours.map((tour) => (
                  <TourCard key={tour.slug} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] bg-white p-10 text-center coastal-shadow">
                <h2 className="text-[22px] font-semibold text-primary">No encontramos tours para ese destino</h2>
                <p className="mt-3 text-on-surface-variant">
                  Prueba con otro país cargado desde el panel administrativo o revisa la lista completa de experiencias.
                </p>
              </div>
            )}

            {filteredTours.length ? (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button type="button" className="rounded-full bg-surface-container p-2 text-primary hover:bg-surface-variant">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="flex gap-2">
                  <button type="button" className="h-10 w-10 rounded-full bg-primary text-sm font-semibold text-on-primary">
                    1
                  </button>
                  <button type="button" className="h-10 w-10 rounded-full bg-surface-container text-sm font-semibold text-primary hover:bg-surface-variant">
                    2
                  </button>
                  <button type="button" className="h-10 w-10 rounded-full bg-surface-container text-sm font-semibold text-primary hover:bg-surface-variant">
                    3
                  </button>
                </div>
                <button type="button" className="rounded-full bg-surface-container p-2 text-primary hover:bg-surface-variant">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <ToursFooter />
      <WhatsappFab />
    </>
  );
}
