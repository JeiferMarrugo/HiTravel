"use client";

import { useCallback, useEffect, useState } from "react";
import type { CatalogCountry, CatalogCurrency } from "@/lib/catalog/catalog-options";
import type { TourCategory } from "@/lib/catalog/types";
import { notify } from "@/lib/toast";

type CatalogData = {
  currencies: CatalogCurrency[];
  countries: CatalogCountry[];
  categories: TourCategory[];
};

function UsdRateEditor({
  initialRate,
  onSave,
}: {
  initialRate: number;
  onSave: (rate: number) => void;
}) {
  const [rate, setRate] = useState(String(initialRate));

  useEffect(() => {
    setRate(String(initialRate));
  }, [initialRate]);

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg bg-surface-container-low p-3">
      <div className="min-w-[200px] flex-1">
        <label className="mb-1 block text-xs font-medium text-on-surface-variant">
          1 USD = pesos colombianos (COP)
        </label>
        <input
          type="number"
          min={1}
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => onSave(Number(rate))}
        className="rounded-lg bg-secondary-container px-3 py-2 text-xs font-semibold text-primary"
      >
        Guardar tasa
      </button>
    </div>
  );
}

export function CatalogOptionsConfig() {
  const [data, setData] = useState<CatalogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newCurrencyCode, setNewCurrencyCode] = useState("");
  const [newCurrencyName, setNewCurrencyName] = useState("");
  const [newCurrencyCopRate, setNewCurrencyCopRate] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/catalog-options");
      const payload = (await response.json()) as CatalogData & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Error al cargar.");
      }
      setData(payload);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>) {
    const response = await fetch("/api/admin/catalog-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as CatalogData & { error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? "Error al guardar.");
    }
    setData(payload);
  }

  async function saveUsdRate(copExchangeRate: number) {
    await post({ kind: "currency-rate", code: "USD", copExchangeRate });
    notify.success("Tasa de cambio actualizada.");
  }

  async function addCurrency(event: React.FormEvent) {
    event.preventDefault();
    try {
      await post({
        kind: "currency",
        code: newCurrencyCode,
        name: newCurrencyName,
        copExchangeRate:
          newCurrencyCode.toUpperCase() === "USD" ? newCurrencyCopRate : undefined,
      });
      setNewCurrencyCode("");
      setNewCurrencyName("");
      setNewCurrencyCopRate("");
      notify.success("Moneda agregada.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error.");
    }
  }

  async function addCountry(event: React.FormEvent) {
    event.preventDefault();
    try {
      await post({ kind: "country", name: newCountry });
      setNewCountry("");
      notify.success("País agregado.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error.");
    }
  }

  async function addCategory(event: React.FormEvent) {
    event.preventDefault();
    try {
      await post({ kind: "category", name: newCategory });
      setNewCategory("");
      notify.success("Categoría agregada.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error.");
    }
  }

  async function remove(target: "currency" | "country" | "category", id: string, label: string) {
    if (!window.confirm(`¿Eliminar «${label}»?`)) {
      return;
    }
    try {
      await post({ kind: "delete", target, id });
      notify.success("Eliminado.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al eliminar.");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-on-surface-variant">Cargando catálogo...</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <article className="rounded-[2rem] bg-white p-6 coastal-shadow space-y-8">
      <header>
        <h2 className="text-xl font-semibold text-primary">Catálogo de tours</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Monedas, países y categorías disponibles al crear experiencias.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Monedas</h3>
        <form onSubmit={addCurrency} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-on-surface-variant">Código</label>
            <input
              required
              maxLength={3}
              value={newCurrencyCode}
              onChange={(e) => setNewCurrencyCode(e.target.value.toUpperCase())}
              placeholder="COP"
              className="w-24 rounded-xl border px-3 py-2 uppercase"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs text-on-surface-variant">Nombre</label>
            <input
              required
              value={newCurrencyName}
              onChange={(e) => setNewCurrencyName(e.target.value)}
              placeholder="Peso colombiano"
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>
          {newCurrencyCode.toUpperCase() === "USD" ? (
            <div className="w-full basis-full">
              <label className="mb-1 block text-xs text-on-surface-variant">
                Tasa de cambio (precio en COP por 1 USD) *
              </label>
              <input
                required
                type="number"
                min={1}
                value={newCurrencyCopRate}
                onChange={(e) => setNewCurrencyCopRate(e.target.value)}
                placeholder="4200"
                className="w-full max-w-xs rounded-xl border px-3 py-2"
              />
              <p className="mt-1 text-xs text-on-surface-variant">
                Ej: 4200 = un dólar equivale a $4.200 COP en el sitio público.
              </p>
            </div>
          ) : null}
          <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            Agregar
          </button>
        </form>
        <ul className="space-y-2">
          {data.currencies.map((item) => (
            <li
              key={item.code}
              className="rounded-xl border border-outline-variant/20 px-4 py-3 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span>
                  <span className="font-semibold text-primary">{item.code}</span>
                  <span className="ml-2 text-sm text-on-surface-variant">{item.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void remove("currency", item.code, item.code)}
                  className="text-xs font-semibold text-on-surface-variant hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
              {item.code === "USD" ? (
                <UsdRateEditor
                  initialRate={item.copExchangeRate ?? 4200}
                  onSave={(rate) => void saveUsdRate(rate)}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 border-t border-outline-variant/20 pt-8">
        <h3 className="text-lg font-semibold text-primary">Países</h3>
        <form onSubmit={addCountry} className="flex flex-wrap gap-3">
          <input
            required
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            placeholder="Nombre del país"
            className="min-w-[220px] flex-1 rounded-xl border px-4 py-2"
          />
          <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            Agregar
          </button>
        </form>
        <ul className="space-y-2">
          {data.countries.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-outline-variant/20 px-4 py-3"
            >
              <span className="font-medium text-primary">{item.name}</span>
              <button
                type="button"
                onClick={() => void remove("country", item.id, item.name)}
                className="text-xs font-semibold text-on-surface-variant hover:text-red-700"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 border-t border-outline-variant/20 pt-8">
        <h3 className="text-lg font-semibold text-primary">Categorías</h3>
        <form onSubmit={addCategory} className="flex flex-wrap gap-3">
          <input
            required
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Ej. Pasadía VIP, Playa, Historia"
            className="min-w-[220px] flex-1 rounded-xl border px-4 py-2"
          />
          <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            Agregar
          </button>
        </form>
        <ul className="space-y-2">
          {data.categories.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-outline-variant/20 px-4 py-3"
            >
              <span className="font-medium text-primary">{item.name}</span>
              <button
                type="button"
                onClick={() => void remove("category", item.id, item.name)}
                className="text-xs font-semibold text-on-surface-variant hover:text-red-700"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
