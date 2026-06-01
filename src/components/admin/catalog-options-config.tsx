"use client";

import { adminFetch } from "@/lib/admin/admin-fetch";
import { submitAdminJsonForm } from "@/lib/admin/submit-admin-json-form";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  onSaved,
}: {
  initialRate: number;
  onSaved: (data: CatalogData) => void;
}) {
  const [rate, setRate] = useState(String(initialRate));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setRate(String(initialRate));
  }, [initialRate]);

  const savePayload = useMemo(
    () => JSON.stringify({ kind: "currency-rate", code: "USD", copExchangeRate: Number(rate) }),
    [rate],
  );

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    await submitAdminJsonForm<CatalogData>(event, {
      url: "/api/admin/catalog-options",
      method: "POST",
      payload: savePayload,
      setSaving: setIsSaving,
      onSuccess: (payload) => {
        onSaved(payload);
        notify.success("Tasa de cambio actualizada.");
      },
    });
  }

  return (
    <form
      method="POST"
      action="/api/admin/catalog-options"
      onSubmit={(event) => void handleSave(event)}
      className="flex flex-wrap items-end gap-2 rounded-lg bg-surface-container-low p-3"
    >
      <input type="hidden" name="payload" value={savePayload} readOnly />
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
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-secondary-container px-3 py-2 text-xs font-semibold text-primary disabled:opacity-60"
      >
        {isSaving ? "Guardando..." : "Guardar tasa"}
      </button>
    </form>
  );
}

export function CatalogOptionsConfig({ initialData }: { initialData?: CatalogData }) {
  const [data, setData] = useState<CatalogData | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(initialData === undefined);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [isSavingCountry, setIsSavingCountry] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [newCurrencyCode, setNewCurrencyCode] = useState("");
  const [newCurrencyName, setNewCurrencyName] = useState("");
  const [newCurrencyCopRate, setNewCurrencyCopRate] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminFetch("/api/admin/catalog-options");
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
    if (initialData !== undefined) {
      return;
    }
    void load();
  }, [initialData, load]);

  const currencyPayload = useMemo(
    () =>
      JSON.stringify({
        kind: "currency",
        code: newCurrencyCode,
        name: newCurrencyName,
        copExchangeRate: newCurrencyCode.toUpperCase() === "USD" ? newCurrencyCopRate : undefined,
      }),
    [newCurrencyCode, newCurrencyName, newCurrencyCopRate],
  );

  const countryPayload = useMemo(() => JSON.stringify({ kind: "country", name: newCountry }), [newCountry]);

  const categoryPayload = useMemo(
    () => JSON.stringify({ kind: "category", name: newCategory }),
    [newCategory],
  );

  async function post(body: Record<string, unknown>) {
    const response = await adminFetch("/api/admin/catalog-options", {
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

  async function addCurrency(event: React.FormEvent<HTMLFormElement>) {
    await submitAdminJsonForm<CatalogData>(event, {
      url: "/api/admin/catalog-options",
      method: "POST",
      payload: currencyPayload,
      setSaving: setIsSavingCurrency,
      onSuccess: (payload) => {
        setData(payload);
        setNewCurrencyCode("");
        setNewCurrencyName("");
        setNewCurrencyCopRate("");
        notify.success("Moneda agregada.");
      },
    });
  }

  async function addCountry(event: React.FormEvent<HTMLFormElement>) {
    await submitAdminJsonForm<CatalogData>(event, {
      url: "/api/admin/catalog-options",
      method: "POST",
      payload: countryPayload,
      setSaving: setIsSavingCountry,
      onSuccess: (payload) => {
        setData(payload);
        setNewCountry("");
        notify.success("País agregado.");
      },
    });
  }

  async function addCategory(event: React.FormEvent<HTMLFormElement>) {
    await submitAdminJsonForm<CatalogData>(event, {
      url: "/api/admin/catalog-options",
      method: "POST",
      payload: categoryPayload,
      setSaving: setIsSavingCategory,
      onSuccess: (payload) => {
        setData(payload);
        setNewCategory("");
        notify.success("Categoría agregada.");
      },
    });
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
        <form
          method="POST"
          action="/api/admin/catalog-options"
          onSubmit={(event) => void addCurrency(event)}
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="payload" value={currencyPayload} readOnly />
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
          <button
            type="submit"
            disabled={isSavingCurrency}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSavingCurrency ? "Guardando..." : "Agregar"}
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
                <UsdRateEditor initialRate={item.copExchangeRate ?? 4200} onSaved={setData} />
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 border-t border-outline-variant/20 pt-8">
        <h3 className="text-lg font-semibold text-primary">Países</h3>
        <form
          method="POST"
          action="/api/admin/catalog-options"
          onSubmit={(event) => void addCountry(event)}
          className="flex flex-wrap gap-3"
        >
          <input type="hidden" name="payload" value={countryPayload} readOnly />
          <input
            required
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            placeholder="Nombre del país"
            className="min-w-[220px] flex-1 rounded-xl border px-4 py-2"
          />
          <button
            type="submit"
            disabled={isSavingCountry}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSavingCountry ? "Guardando..." : "Agregar"}
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
        <form
          method="POST"
          action="/api/admin/catalog-options"
          onSubmit={(event) => void addCategory(event)}
          className="flex flex-wrap gap-3"
        >
          <input type="hidden" name="payload" value={categoryPayload} readOnly />
          <input
            required
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Ej. Pasadía VIP, Playa, Historia"
            className="min-w-[220px] flex-1 rounded-xl border px-4 py-2"
          />
          <button
            type="submit"
            disabled={isSavingCategory}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSavingCategory ? "Guardando..." : "Agregar"}
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
