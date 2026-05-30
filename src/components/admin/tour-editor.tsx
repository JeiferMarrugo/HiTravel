"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TourImagesSection } from "@/components/admin/tour-images-section";
import { amountFromStorage, amountToStorage, moneyInputHint } from "@/lib/catalog/money";
import type {
  CatalogCountry,
  CatalogCurrency,
} from "@/lib/catalog/catalog-options";
import type { ItineraryItem, PackageType, PricingSeason, TourCategory, TourRecord } from "@/lib/catalog/types";
import { notify } from "@/lib/toast";

const PACKAGE_TYPES: { value: PackageType; label: string }[] = [
  { value: "pasadia", label: "Pasadía" },
  { value: "paquete", label: "Paquete" },
  { value: "tour", label: "Tour" },
  { value: "experiencia", label: "Experiencia" },
];

function emptyTour(): Omit<TourRecord, "id" | "createdAt" | "updatedAt" | "categoryName"> {
  return {
    slug: "",
    name: "",
    categoryId: null,
    packageType: "pasadia",
    badge: null,
    country: "Colombia",
    location: "",
    shortDescription: "",
    description: "",
    longDescription: [""],
    priceFromCents: 0,
    currency: "USD",
    rating: 4.8,
    reviewsCount: 0,
    durationLabel: "",
    groupSizeLabel: "",
    languages: "ES / EN",
    heroImageUrl: null,
    gallery: [],
    includes: [""],
    excludes: [""],
    highlights: [""],
    meetingPoint: null,
    cancellationPolicy: null,
    pricingSeasons: [],
    itinerary: [],
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
  };
}

function linesToList(lines: string[]) {
  return lines.map((line) => line.trim()).filter(Boolean);
}

function listToLines(items: string[]) {
  return items.length ? items : [""];
}

type TourEditorProps = {
  tourId?: string;
  isNew?: boolean;
};

export function TourEditor({ tourId, isNew = false }: TourEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [catalog, setCatalog] = useState<{
    currencies: CatalogCurrency[];
    countries: CatalogCountry[];
    categories: TourCategory[];
  } | null>(null);
  const [form, setForm] = useState(emptyTour());
  const [longDescription, setLongDescription] = useState([""]);
  const [includes, setIncludes] = useState([""]);
  const [excludes, setExcludes] = useState([""]);
  const [highlights, setHighlights] = useState([""]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [pricing, setPricing] = useState<PricingSeason[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);

  const loadCatalog = useCallback(async () => {
    const response = await fetch("/api/admin/catalog-options/active");
    const payload = (await response.json()) as {
      currencies: CatalogCurrency[];
      countries: CatalogCountry[];
      categories: TourCategory[];
      error?: string;
    };
    if (!response.ok) {
      throw new Error(payload.error ?? "No fue posible cargar el catálogo.");
    }
    setCatalog(payload);
    return payload;
  }, []);

  const loadTour = useCallback(async () => {
    setIsLoading(true);
    try {
      const catalogData = await loadCatalog();

      if (!tourId || isNew) {
        const defaultCountry = catalogData.countries[0]?.name ?? "Colombia";
        const defaultCurrency = catalogData.currencies[0]?.code ?? "COP";
        setForm((current) => ({
          ...current,
          country: defaultCountry,
          currency: defaultCurrency,
        }));
        return;
      }

      const response = await fetch(`/api/admin/tours/${tourId}`);
      const data = (await response.json()) as TourRecord & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible cargar el tour.");
      }

      setForm({
        ...data,
        priceFromCents: amountFromStorage(data.priceFromCents, data.currency),
      });
      setLongDescription(listToLines(data.longDescription));
      setIncludes(listToLines(data.includes));
      setExcludes(listToLines(data.excludes));
      setHighlights(listToLines(data.highlights));
      setGallery(data.gallery);
      setPricing(data.pricingSeasons);
      setItinerary(data.itinerary);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar.");
    } finally {
      setIsLoading(false);
    }
  }, [isNew, loadCatalog, tourId]);

  useEffect(() => {
    void loadTour();
  }, [loadTour]);

  async function uploadFile(file: File, target: "hero" | "gallery") {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "tours");

      const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Error al subir imagen.");
      }

      if (target === "hero") {
        setForm((current) => ({ ...current, heroImageUrl: payload.url! }));
      } else {
        setGallery((current) => [...current, payload.url!]);
      }
      notify.success("Imagen subida correctamente.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al subir.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        longDescription: linesToList(longDescription),
        includes: linesToList(includes),
        excludes: linesToList(excludes),
        highlights: linesToList(highlights),
        gallery,
        pricingSeasons: pricing,
        itinerary,
        priceFromCents: amountToStorage(Number(form.priceFromCents) || 0, form.currency),
      };

      const response = await fetch(isNew ? "/api/admin/tours" : `/api/admin/tours/${tourId}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as TourRecord & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible guardar.");
      }

      notify.success(isNew ? "Tour creado." : "Tour actualizado.");
      router.push(`/admin/tours/${data.id}`);
      router.refresh();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-on-surface-variant">Cargando experiencia...</p>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap gap-3">
        <Link href="/admin/tours" className="rounded-2xl border border-outline-variant/30 bg-white px-5 py-3 text-sm font-semibold text-primary">
          Volver al inventario
        </Link>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : isNew ? "Crear experiencia" : "Guardar cambios"}
        </button>
      </section>

      <article className="rounded-[2rem] bg-white p-6 coastal-shadow space-y-4">
        <h2 className="text-lg font-semibold text-primary">Información básica</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-on-surface-variant">Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Tipo *</label>
            <select
              value={form.packageType}
              onChange={(e) => setForm({ ...form, packageType: e.target.value as PackageType })}
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            >
              {PACKAGE_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Categoría</label>
            <select
              value={form.categoryId ?? ""}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value ? e.target.value : null })
              }
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            >
              <option value="">Sin categoría</option>
              {form.categoryId &&
              !catalog?.categories.some((item) => item.id === form.categoryId) ? (
                <option value={form.categoryId}>Categoría actual</option>
              ) : null}
              {catalog?.categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Badge (opcional)</label>
            <input
              value={form.badge ?? ""}
              onChange={(e) => setForm({ ...form, badge: e.target.value || null })}
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">País</label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            >
              {form.country &&
              !catalog?.countries.some((item) => item.name === form.country) ? (
                <option value={form.country}>{form.country}</option>
              ) : null}
              {catalog?.countries.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Ubicación</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Duración</label>
            <input
              value={form.durationLabel}
              onChange={(e) => setForm({ ...form, durationLabel: e.target.value })}
              placeholder="8 horas"
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Capacidad / grupo</label>
            <input
              value={form.groupSizeLabel}
              onChange={(e) => setForm({ ...form, groupSizeLabel: e.target.value })}
              placeholder="Máx. 15"
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Precio desde</label>
            <input
              type="number"
              min={0}
              value={form.priceFromCents || ""}
              onChange={(e) => setForm({ ...form, priceFromCents: Number(e.target.value) })}
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            />
            <p className="mt-1 text-xs text-on-surface-variant">{moneyInputHint(form.currency)}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Moneda</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            >
              {form.currency &&
              !catalog?.currencies.some((item) => item.code === form.currency) ? (
                <option value={form.currency}>{form.currency}</option>
              ) : null}
              {catalog?.currencies.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} — {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Descripción corta (listado)</label>
          <textarea
            rows={2}
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Descripción completa</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Párrafos adicionales (uno por línea)</label>
          {longDescription.map((paragraph, index) => (
            <textarea
              key={index}
              rows={2}
              value={paragraph}
              onChange={(e) => {
                const next = [...longDescription];
                next[index] = e.target.value;
                setLongDescription(next);
              }}
              className="mb-2 w-full rounded-xl border border-outline-variant/30 px-4 py-3"
            />
          ))}
          <button
            type="button"
            onClick={() => setLongDescription([...longDescription, ""])}
            className="text-sm font-semibold text-primary"
          >
            + Añadir párrafo
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Publicado (activo)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Destacado en inicio
          </label>
        </div>
      </article>

      <TourImagesSection
        heroImageUrl={form.heroImageUrl}
        gallery={gallery}
        isUploading={isUploading}
        onHeroChange={(url) => setForm((current) => ({ ...current, heroImageUrl: url }))}
        onGalleryChange={setGallery}
        onUpload={uploadFile}
      />

      <article className="rounded-[2rem] bg-white p-6 coastal-shadow space-y-4">
        <h2 className="text-lg font-semibold text-primary">Incluye / No incluye / Destacados</h2>
        {[
          { label: "Incluye", state: includes, setState: setIncludes },
          { label: "No incluye", state: excludes, setState: setExcludes },
          { label: "Destacados", state: highlights, setState: setHighlights },
        ].map((section) => (
          <div key={section.label}>
            <p className="mb-2 text-sm font-medium text-on-surface-variant">{section.label}</p>
            {section.state.map((line, index) => (
              <input
                key={index}
                value={line}
                onChange={(e) => {
                  const next = [...section.state];
                  next[index] = e.target.value;
                  section.setState(next);
                }}
                className="mb-2 w-full rounded-xl border border-outline-variant/30 px-4 py-2 text-sm"
              />
            ))}
            <button
              type="button"
              onClick={() => section.setState([...section.state, ""])}
              className="text-sm font-semibold text-primary"
            >
              + Línea
            </button>
          </div>
        ))}
      </article>

      <article className="rounded-[2rem] bg-white p-6 coastal-shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Itinerario</h2>
          <button
            type="button"
            onClick={() =>
              setItinerary([
                ...itinerary,
                { id: crypto.randomUUID(), time: "", title: "", description: "" },
              ])
            }
            className="text-sm font-semibold text-primary"
          >
            + Paso
          </button>
        </div>
        {itinerary.map((step, index) => (
          <div key={step.id} className="grid gap-2 rounded-xl border border-outline-variant/20 p-4 md:grid-cols-4">
            <input
              value={step.time}
              placeholder="08:00"
              onChange={(e) => {
                const next = [...itinerary];
                next[index] = { ...step, time: e.target.value };
                setItinerary(next);
              }}
              className="rounded-xl border px-3 py-2 text-sm"
            />
            <input
              value={step.title}
              placeholder="Título"
              onChange={(e) => {
                const next = [...itinerary];
                next[index] = { ...step, title: e.target.value };
                setItinerary(next);
              }}
              className="rounded-xl border px-3 py-2 text-sm md:col-span-1"
            />
            <textarea
              value={step.description}
              placeholder="Descripción"
              rows={2}
              onChange={(e) => {
                const next = [...itinerary];
                next[index] = { ...step, description: e.target.value };
                setItinerary(next);
              }}
              className="rounded-xl border px-3 py-2 text-sm md:col-span-2"
            />
          </div>
        ))}
      </article>

      <article className="rounded-[2rem] bg-white p-6 coastal-shadow space-y-4">
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Punto de encuentro</label>
          <input
            value={form.meetingPoint ?? ""}
            onChange={(e) => setForm({ ...form, meetingPoint: e.target.value || null })}
            className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Política de cancelación</label>
          <textarea
            rows={3}
            value={form.cancellationPolicy ?? ""}
            onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value || null })}
            className="w-full rounded-xl border border-outline-variant/30 px-4 py-3"
          />
        </div>
      </article>
    </div>
  );
}
