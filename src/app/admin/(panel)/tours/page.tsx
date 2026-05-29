import Image from "next/image";
import Link from "next/link";
import { adminTourCategories, adminTours } from "@/lib/admin/admin-tours-data";

export default function AdminToursPage() {
  return (
    <div className="w-full">
      <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Inventario de tours</h1>
          <p className="mt-2 max-w-3xl text-lg text-on-surface-variant">
            Administra experiencias, actualiza tarifas y controla la disponibilidad para la próxima temporada.
          </p>
        </div>

        <Link
          href="/admin/tours/nuevo"
          className="rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-white coastal-shadow"
        >
          + Agregar nuevo tour
        </Link>
      </section>

      <section className="mb-8 flex flex-wrap items-center gap-3">
        {adminTourCategories.map((category) => (
          <button
            key={category.label}
            type="button"
            className={`rounded-full px-5 py-3 text-sm font-medium ${
              category.active ? "bg-primary text-white" : "bg-surface-container text-on-surface"
            }`}
          >
            {category.label}
            <span className="ml-2 text-xs opacity-70">{category.count}</span>
          </button>
        ))}

        <button type="button" className="ml-auto text-sm text-on-surface-variant">
          Filtros avanzados
        </button>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
        {adminTours.map((tour) => (
          <article key={tour.id} className="overflow-hidden rounded-[2rem] bg-white coastal-shadow">
            <div className="relative h-64">
              <Image src={tour.image} alt={tour.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <span className="absolute right-4 top-4 rounded-full bg-secondary-container px-4 py-2 text-sm font-bold text-primary">
                {tour.price}
              </span>
              <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {tour.category}
              </span>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[22px] font-semibold text-primary">{tour.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">{tour.description}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-primary">
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  <span>{tour.rating}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-outline-variant/20 pt-5">
                <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {tour.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    {tour.capacity}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                    {tour.active ? "Activo" : "Pausado"}
                  </span>
                  <button
                    type="button"
                    className={`relative h-7 w-12 rounded-full transition ${tour.active ? "bg-primary" : "bg-surface-container-high"}`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        tour.active ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <Link href={`/admin/tours/${tour.id}`} className="text-sm font-semibold text-primary">
                  Editar tour
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="mt-10 text-center">
        <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Cargar más tours
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
