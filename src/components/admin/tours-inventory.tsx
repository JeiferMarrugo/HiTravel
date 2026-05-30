"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatMoneyDisplay } from "@/lib/catalog/money";
import type { TourListItem } from "@/lib/catalog/types";
import { notify } from "@/lib/toast";

export function ToursInventory() {
  const [tours, setTours] = useState<TourListItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/tours");
      const data = (await response.json()) as { tours: TourListItem[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Error al cargar tours.");
      }
      setTours(data.tours);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = ["all", ...new Set(tours.map((t) => t.categoryName).filter(Boolean) as string[])];
  const filtered =
    filter === "all" ? tours : tours.filter((t) => t.categoryName === filter);

  return (
    <>
      <section className="mb-8 flex flex-wrap items-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilter(category)}
            className={`rounded-full px-5 py-3 text-sm font-medium ${
              filter === category ? "bg-primary text-white" : "bg-surface-container text-on-surface"
            }`}
          >
            {category === "all" ? "Todos" : category}
          </button>
        ))}
      </section>

      {isLoading ? (
        <p className="text-on-surface-variant">Cargando inventario...</p>
      ) : (
        <section className="grid gap-6 md:grid-cols-2">
          {filtered.map((tour) => (
            <article key={tour.id} className="overflow-hidden rounded-[2rem] bg-white coastal-shadow">
              <div className="relative h-56 bg-surface-container-low">
                {tour.heroImageUrl ? (
                  <Image
                    src={tour.heroImageUrl}
                    alt={tour.name}
                    fill
                    className="object-cover"
                    unoptimized={tour.heroImageUrl.startsWith("/uploads")}
                  />
                ) : null}
                <span className="absolute right-4 top-4 rounded-full bg-secondary-container px-4 py-2 text-sm font-bold text-primary">
                  {formatMoneyDisplay(tour.priceFromCents, tour.currency)}
                </span>
                <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  {tour.categoryName ?? tour.packageType}
                </span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-primary">{tour.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">{tour.shortDescription}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-on-surface-variant">
                    {tour.isActive ? "Activo" : "Pausado"}
                  </span>
                  <Link href={`/admin/tours/${tour.id}`} className="text-sm font-semibold text-primary">
                    Editar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {!isLoading && !filtered.length ? (
        <p className="text-on-surface-variant">No hay experiencias. Crea la primera con el botón superior.</p>
      ) : null}
    </>
  );
}
