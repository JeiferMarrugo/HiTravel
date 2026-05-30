"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PROMOTION_CONFIG,
  PROMOTION_TYPE_OPTIONS,
  promotionTypeLabel,
  summarizePromotionConfig,
  type PromotionConfig,
  type PromotionType,
} from "@/lib/catalog/promotion-types";
import type { PromotionRecord, TourListItem } from "@/lib/catalog/types";
import { notify } from "@/lib/toast";

type PromoForm = {
  name: string;
  description: string;
  promotionType: PromotionType;
  config: PromotionConfig;
  tourIds: string[];
  allTours: boolean;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm = (): PromoForm => ({
  name: "",
  description: "",
  promotionType: "percent_discount",
  config: { ...DEFAULT_PROMOTION_CONFIG.percent_discount },
  tourIds: [],
  allTours: true,
  validFrom: "",
  validUntil: "",
  isActive: true,
  sortOrder: "0",
});

function ConfigFields({
  type,
  config,
  onChange,
}: {
  type: PromotionType;
  config: PromotionConfig;
  onChange: (config: PromotionConfig) => void;
}) {
  switch (type) {
    case "percent_discount":
      return (
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Porcentaje (%)</label>
          <input
            type="number"
            min={1}
            max={100}
            value={config.percent ?? 10}
            onChange={(e) => onChange({ ...config, percent: Number(e.target.value) })}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>
      );
    case "fixed_discount":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Monto a descontar</label>
            <input
              type="number"
              min={1}
              value={config.amount ?? 50000}
              onChange={(e) => onChange({ ...config, amount: Number(e.target.value) })}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Moneda</label>
            <select
              value={config.currency ?? "COP"}
              onChange={(e) => onChange({ ...config, currency: e.target.value })}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="COP">COP</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      );
    case "free_child":
      return (
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Cantidad de niños gratis</label>
          <input
            type="number"
            min={1}
            value={config.freeChildren ?? 1}
            onChange={(e) => onChange({ ...config, freeChildren: Number(e.target.value) })}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>
      );
    case "second_passenger_discount":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Aplica a</label>
            <select
              value={config.passengerType ?? "adult"}
              onChange={(e) =>
                onChange({ ...config, passengerType: e.target.value as "adult" | "child" })
              }
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="adult">Segundo adulto</option>
              <option value="child">Segundo niño</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Descuento (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={config.percent ?? 50}
              onChange={(e) => onChange({ ...config, percent: Number(e.target.value) })}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
        </div>
      );
    case "group_discount":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Mínimo de personas</label>
            <input
              type="number"
              min={2}
              value={config.minPeople ?? 4}
              onChange={(e) => onChange({ ...config, minPeople: Number(e.target.value) })}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Descuento (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={config.percent ?? 10}
              onChange={(e) => onChange({ ...config, percent: Number(e.target.value) })}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
        </div>
      );
    case "early_booking":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Días mínimos de anticipación</label>
            <input
              type="number"
              min={1}
              value={config.minDaysAhead ?? 14}
              onChange={(e) => onChange({ ...config, minDaysAhead: Number(e.target.value) })}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Descuento (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={config.percent ?? 5}
              onChange={(e) => onChange({ ...config, percent: Number(e.target.value) })}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function PromotionsManager() {
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [tours, setTours] = useState<TourListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [promoRes, toursRes] = await Promise.all([
        fetch("/api/admin/promotions"),
        fetch("/api/admin/tours"),
      ]);
      const promoData = (await promoRes.json()) as { promotions: PromotionRecord[]; error?: string };
      const toursData = (await toursRes.json()) as { tours: TourListItem[] };
      if (!promoRes.ok) {
        throw new Error(promoData.error ?? "Error al cargar promociones.");
      }
      setPromotions(promoData.promotions);
      setTours(toursData.tours ?? []);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEdit(promo: PromotionRecord) {
    setEditingId(promo.id);
    setForm({
      name: promo.name,
      description: promo.description ?? "",
      promotionType: promo.promotionType,
      config: { ...promo.config },
      tourIds: promo.tourIds ?? [],
      allTours: !promo.tourIds?.length,
      validFrom: promo.validFrom ? promo.validFrom.slice(0, 10) : "",
      validUntil: promo.validUntil ? promo.validUntil.slice(0, 10) : "",
      isActive: promo.isActive,
      sortOrder: String(promo.sortOrder),
    });
    setShowForm(true);
  }

  function changeType(type: PromotionType) {
    setForm({
      ...form,
      promotionType: type,
      config: { ...DEFAULT_PROMOTION_CONFIG[type] },
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        promotionType: form.promotionType,
        config: form.config,
        tourIds: form.allTours ? null : form.tourIds,
        validFrom: form.validFrom || null,
        validUntil: form.validUntil || null,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
      };

      const response = await fetch(
        editingId ? `/api/admin/promotions/${editingId}` : "/api/admin/promotions",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Error al guardar.");
      }
      notify.success(editingId ? "Promoción actualizada." : "Promoción creada.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      await load();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al guardar.");
    }
  }

  async function toggleActive(promo: PromotionRecord) {
    try {
      const response = await fetch(`/api/admin/promotions/${promo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Error al actualizar.");
      }
      await load();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error.");
    }
  }

  async function removePromo(id: string) {
    if (!window.confirm("¿Eliminar esta promoción?")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Error al eliminar.");
      }
      notify.success("Promoción eliminada.");
      await load();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al eliminar.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-on-surface-variant">
          {promotions.filter((p) => p.isActive).length} activas de {promotions.length} configuradas
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
        >
          + Nueva promoción
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 coastal-shadow space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            {editingId ? "Editar promoción" : "Nueva promoción"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Nombre *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Tipo *</label>
              <select
                value={form.promotionType}
                onChange={(e) => changeType(e.target.value as PromotionType)}
                className="w-full rounded-xl border px-4 py-3"
              >
                {PROMOTION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-on-surface-variant">
                {PROMOTION_TYPE_OPTIONS.find((o) => o.value === form.promotionType)?.description}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <ConfigFields
            type={form.promotionType}
            config={form.config}
            onChange={(config) => setForm({ ...form, config })}
          />

          <div className="rounded-xl bg-surface-container-low p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.allTours}
                onChange={(e) => setForm({ ...form, allTours: e.target.checked, tourIds: [] })}
              />
              Aplica a todos los tours
            </label>
            {!form.allTours ? (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {tours.map((tour) => (
                  <label key={tour.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.tourIds.includes(tour.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...form.tourIds, tour.id]
                          : form.tourIds.filter((id) => id !== tour.id);
                        setForm({ ...form, tourIds: next });
                      }}
                    />
                    {tour.name}
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Válida desde</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Válida hasta</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Orden</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Promoción activa
          </label>

          <div className="flex gap-3">
            <button type="submit" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="rounded-xl border px-5 py-3 text-sm font-semibold text-on-surface-variant"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-on-surface-variant">Cargando promociones...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {promotions.map((promo) => (
            <article key={promo.id} className="rounded-[2rem] bg-white p-6 coastal-shadow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-primary">{promotionTypeLabel(promo.promotionType)}</p>
                  <h3 className="text-lg font-bold text-primary">{promo.name}</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {summarizePromotionConfig(promo.promotionType, promo.config)}
                  </p>
                  {promo.description ? (
                    <p className="mt-2 text-sm">{promo.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-on-surface-variant">
                    {promo.tourIds?.length
                      ? `Solo ${promo.tourIds.length} tour(s)`
                      : "Todos los tours"}
                    {promo.validFrom || promo.validUntil
                      ? ` · Vigencia ${promo.validFrom?.slice(0, 10) ?? "—"} → ${promo.validUntil?.slice(0, 10) ?? "—"}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    promo.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {promo.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(promo)}
                  className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void toggleActive(promo)}
                  className="rounded-full border border-outline-variant/40 px-3 py-1 text-xs font-semibold"
                >
                  {promo.isActive ? "Desactivar" : "Activar"}
                </button>
                <button
                  type="button"
                  onClick={() => void removePromo(promo.id)}
                  className="rounded-full border border-outline-variant/40 px-3 py-1 text-xs font-semibold text-on-surface-variant"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && !promotions.length ? (
        <p className="rounded-[2rem] bg-white p-12 text-center text-on-surface-variant coastal-shadow">
          No hay promociones registradas.
        </p>
      ) : null}
    </div>
  );
}
