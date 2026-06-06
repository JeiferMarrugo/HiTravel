"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatFilterPrice } from "@/lib/tours/filter-tours";
import {
  buildToursUrl,
  parseCategoryParam,
  parseMaxPriceParam,
  serializeCategoryParam,
  type ToursSearchParams,
} from "@/lib/tours/tours-url";
import type { DisplayCurrency } from "@/lib/pricing/display-currency";

type ToursFiltersProps = {
  categories: string[];
  priceMin: number;
  priceMax: number;
  displayCurrency: DisplayCurrency;
};

function readSearchParams(searchParams: URLSearchParams): ToursSearchParams {
  return {
    destino: searchParams.get("destino") ?? undefined,
    adultos: searchParams.get("adultos") ?? undefined,
    ninos: searchParams.get("ninos") ?? undefined,
    fecha: searchParams.get("fecha") ?? undefined,
    categoria: searchParams.get("categoria") ?? undefined,
    precioMax: searchParams.get("precioMax") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  };
}

function filterParamsWithoutPage(searchParams: ToursSearchParams) {
  const { page: _page, ...rest } = searchParams;
  return rest;
}

export function ToursFilters({
  categories,
  priceMin,
  priceMax,
  displayCurrency,
}: ToursFiltersProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draggingPrice, setDraggingPrice] = useState<number | null>(null);

  const searchParams = readSearchParams(urlSearchParams);
  const selectedCategories = parseCategoryParam(searchParams.categoria);
  const selectedMaxPrice = parseMaxPriceParam(searchParams.precioMax);
  const sliderValue = draggingPrice ?? selectedMaxPrice ?? priceMax;
  const hasPriceFilter = selectedMaxPrice !== null && priceMax > priceMin;
  const hasActiveFilters = selectedCategories.length > 0 || hasPriceFilter;

  const navigate = useCallback(
    (nextParams: ToursSearchParams) => {
      startTransition(() => {
        router.push(buildToursUrl(1, filterParamsWithoutPage(nextParams)));
      });
    },
    [router],
  );

  useEffect(() => {
    setDraggingPrice(null);
  }, [searchParams.precioMax, priceMax]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function toggleCategory(category: string) {
    const current = readSearchParams(urlSearchParams);
    const active = parseCategoryParam(current.categoria);
    const isSelected = active.includes(category);
    const nextCategories = isSelected
      ? active.filter((item) => item !== category)
      : [...active, category];

    navigate({
      ...current,
      categoria: serializeCategoryParam(nextCategories),
      page: undefined,
    });
  }

  function selectAllCategories() {
    const current = readSearchParams(urlSearchParams);
    navigate({ ...current, categoria: undefined, page: undefined });
  }

  function handlePriceInput(value: number) {
    setDraggingPrice(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const current = readSearchParams(new URLSearchParams(window.location.search));
      const nextMax = value >= priceMax ? undefined : String(Math.round(value));
      setDraggingPrice(null);
      navigate({ ...current, precioMax: nextMax, page: undefined });
    }, 250);
  }

  function clearFilters() {
    const current = readSearchParams(urlSearchParams);
    navigate({
      destino: current.destino,
      adultos: current.adultos,
      ninos: current.ninos,
      fecha: current.fecha,
    });
  }

  const sliderStep =
    displayCurrency === "USD" ? 1 : Math.max(1000, Math.round((priceMax - priceMin) / 200));

  return (
    <div
      className={`coastal-mist-shadow sticky top-28 rounded-xl bg-surface-container-low p-6 transition-opacity ${
        isPending ? "opacity-70" : ""
      }`}
    >
      <h3 className="mb-6 text-[22px] font-semibold text-primary">Filtros</h3>

      <div className="mb-8">
        <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.2em] text-outline">
          Categoría
        </span>
        <div className="space-y-3">
          <label className="group flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={selectedCategories.length === 0}
              onChange={() => selectAllCategories()}
              className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span className="text-base text-on-surface-variant group-hover:text-primary">Todos</span>
          </label>

          {categories.map((category) => (
            <label key={category} className="group flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-base text-on-surface-variant group-hover:text-primary">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {priceMax > priceMin ? (
        <div className="mb-8">
          <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.2em] text-outline">
            Rango de precio
          </span>
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            step={sliderStep}
            value={sliderValue}
            onChange={(event) => handlePriceInput(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-variant accent-primary"
            aria-valuemin={priceMin}
            aria-valuemax={priceMax}
            aria-valuenow={sliderValue}
            aria-label="Precio máximo"
          />
          <div className="mt-2 flex justify-between gap-2 text-sm text-on-surface-variant">
            <span>{formatFilterPrice(priceMin, displayCurrency)}</span>
            <span className="text-center font-medium text-primary">
              Hasta {formatFilterPrice(sliderValue, displayCurrency)}
            </span>
            <span>{formatFilterPrice(priceMax, displayCurrency)}+</span>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={clearFilters}
        disabled={!hasActiveFilters}
        className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
