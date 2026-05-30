"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteContent, SiteStat, SiteValueCard } from "@/lib/site-content/types";
import { defaultSiteContent } from "@/lib/site-content/defaults";
import { SiteImageField } from "@/components/admin/site-image-field";
import { normalizeCountryName } from "@/lib/countries";
import { notify } from "@/lib/toast";

const sections = [
  { id: "brand", label: "Marca y contacto" },
  { id: "home", label: "Inicio" },
  { id: "tours", label: "Listado tours" },
  { id: "about", label: "Nosotros" },
  { id: "contact", label: "Contacto" },
  { id: "footer", label: "Footer y redes" },
  { id: "countries", label: "Países buscador" },
  { id: "pricing", label: "Precios y moneda" },
] as const;

type SectionId = (typeof sections)[number]["id"];

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className = "w-full rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm outline-none";
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-on-surface-variant">{label}</label>
      {multiline ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={className} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={className} />
      )}
    </div>
  );
}

export function SiteContentConfig() {
  const [active, setActive] = useState<SectionId>("brand");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [newCountry, setNewCountry] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/site-content", { cache: "no-store" });
      const data = (await response.json()) as SiteContent & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Error al cargar.");
      }
      setContent(data);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar contenido.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = (await response.json()) as SiteContent & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Error al guardar.");
      }
      setContent(data);
      notify.success("Contenido del sitio guardado. Recarga la web pública para ver los cambios.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  function patchStat(index: number, patch: Partial<SiteStat>) {
    setContent((current) => {
      const stats = [...current.about.stats];
      stats[index] = { ...stats[index], ...patch };
      return { ...current, about: { ...current.about, stats } };
    });
  }

  function patchValue(index: number, patch: Partial<SiteValueCard>) {
    setContent((current) => {
      const values = [...current.about.values];
      values[index] = { ...values[index], ...patch };
      return { ...current, about: { ...current.about, values } };
    });
  }

  if (isLoading) {
    return <p className="text-sm text-on-surface-variant">Cargando contenido del sitio...</p>;
  }

  return (
    <article className="rounded-[2rem] bg-white coastal-shadow overflow-hidden">
      <div className="border-b border-outline-variant/15 bg-gradient-to-r from-primary/5 to-secondary-container/30 px-6 py-5">
        <h2 className="text-lg font-semibold text-primary">Sitio público (textos e imágenes)</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Todo lo que no son tours: inicio, nosotros, contacto, footer, marca y países del buscador.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-outline-variant/15 px-4 py-3">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActive(section.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              active === section.id ? "bg-primary text-white" : "bg-surface-container-low text-primary"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-6">
        {active === "brand" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre de marca" value={content.brand.name} onChange={(v) => setContent({ ...content, brand: { ...content.brand, name: v } })} />
            <Field label="Texto botón nav" value={content.brand.navCtaLabel} onChange={(v) => setContent({ ...content, brand: { ...content.brand, navCtaLabel: v } })} />
            <div className="md:col-span-2">
              <SiteImageField label="Logo (footer)" value={content.brand.logoUrl} onChange={(v) => setContent({ ...content, brand: { ...content.brand, logoUrl: v } })} aspectClass="aspect-square max-w-[120px]" />
            </div>
            <Field label="Teléfono" value={content.contact.phone} onChange={(v) => setContent({ ...content, contact: { ...content.contact, phone: v } })} />
            <Field label="Email" value={content.contact.email} onChange={(v) => setContent({ ...content, contact: { ...content.contact, email: v } })} />
            <Field label="WhatsApp (URL wa.me)" value={content.contact.whatsappUrl} onChange={(v) => setContent({ ...content, contact: { ...content.contact, whatsappUrl: v } })} />
            <Field label="Dirección línea 1" value={content.contact.address} onChange={(v) => setContent({ ...content, contact: { ...content.contact, address: v } })} />
            <Field label="Dirección línea 2" value={content.contact.addressLine2} onChange={(v) => setContent({ ...content, contact: { ...content.contact, addressLine2: v } })} />
          </div>
        ) : null}

        {active === "home" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <SiteImageField label="Hero inicio" value={content.home.heroImageUrl} onChange={(v) => setContent({ ...content, home: { ...content.home, heroImageUrl: v } })} />
            </div>
            <Field label="Título hero" value={content.home.heroTitle} onChange={(v) => setContent({ ...content, home: { ...content.home, heroTitle: v } })} />
            <Field label="Subtítulo hero" value={content.home.heroSubtitle} onChange={(v) => setContent({ ...content, home: { ...content.home, heroSubtitle: v } })} multiline />
            <Field label="Badge tours destacados" value={content.home.featuredBadge} onChange={(v) => setContent({ ...content, home: { ...content.home, featuredBadge: v } })} />
            <Field label="Título tours destacados" value={content.home.featuredTitle} onChange={(v) => setContent({ ...content, home: { ...content.home, featuredTitle: v } })} />
            <div className="md:col-span-2">
              <SiteImageField label="Imagen sección pasadías" value={content.home.dayTripsImageUrl} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsImageUrl: v } })} />
            </div>
            <Field label="Badge pasadías" value={content.home.dayTripsBadge} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsBadge: v } })} />
            <Field label="Título pasadías" value={content.home.dayTripsTitle} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsTitle: v } })} />
            <Field label="Descripción pasadías" value={content.home.dayTripsDescription} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsDescription: v } })} multiline />
            <Field label="Highlight 1 título" value={content.home.dayTripsHighlight1Title} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsHighlight1Title: v } })} />
            <Field label="Highlight 1 texto" value={content.home.dayTripsHighlight1Text} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsHighlight1Text: v } })} />
            <Field label="Highlight 2 título" value={content.home.dayTripsHighlight2Title} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsHighlight2Title: v } })} />
            <Field label="Highlight 2 texto" value={content.home.dayTripsHighlight2Text} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsHighlight2Text: v } })} />
            <Field label="Tarjeta flotante título" value={content.home.dayTripsCardTitle} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsCardTitle: v } })} />
            <Field label="Tarjeta flotante subtítulo" value={content.home.dayTripsCardSubtitle} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsCardSubtitle: v } })} />
            <Field label="CTA pasadías" value={content.home.dayTripsCtaLabel} onChange={(v) => setContent({ ...content, home: { ...content.home, dayTripsCtaLabel: v } })} />
            <Field label="Título «Por qué elegir»" value={content.home.whyTitle} onChange={(v) => setContent({ ...content, home: { ...content.home, whyTitle: v } })} />
            <Field label="Subtítulo «Por qué elegir»" value={content.home.whySubtitle} onChange={(v) => setContent({ ...content, home: { ...content.home, whySubtitle: v } })} multiline />
            <Field label="Tarjeta guías - título" value={content.home.whyGuidesTitle} onChange={(v) => setContent({ ...content, home: { ...content.home, whyGuidesTitle: v } })} />
            <Field label="Tarjeta guías - texto" value={content.home.whyGuidesText} onChange={(v) => setContent({ ...content, home: { ...content.home, whyGuidesText: v } })} multiline />
            <Field label="Seguridad - título" value={content.home.whySafetyTitle} onChange={(v) => setContent({ ...content, home: { ...content.home, whySafetyTitle: v } })} />
            <Field label="Seguridad - texto" value={content.home.whySafetyText} onChange={(v) => setContent({ ...content, home: { ...content.home, whySafetyText: v } })} multiline />
            <Field label="WhatsApp - título" value={content.home.whyWhatsappTitle} onChange={(v) => setContent({ ...content, home: { ...content.home, whyWhatsappTitle: v } })} />
            <Field label="WhatsApp - texto" value={content.home.whyWhatsappText} onChange={(v) => setContent({ ...content, home: { ...content.home, whyWhatsappText: v } })} multiline />
            <Field label="Flexibles - título" value={content.home.whyFlexibleTitle} onChange={(v) => setContent({ ...content, home: { ...content.home, whyFlexibleTitle: v } })} />
            <Field label="Flexibles - texto" value={content.home.whyFlexibleText} onChange={(v) => setContent({ ...content, home: { ...content.home, whyFlexibleText: v } })} multiline />
          </div>
        ) : null}

        {active === "tours" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Título página" value={content.toursPage.title} onChange={(v) => setContent({ ...content, toursPage: { ...content.toursPage, title: v } })} />
            <Field label="Subtítulo" value={content.toursPage.subtitle} onChange={(v) => setContent({ ...content, toursPage: { ...content.toursPage, subtitle: v } })} multiline />
            <Field label="Sin resultados (con tours)" value={content.toursPage.emptyWithToursTitle} onChange={(v) => setContent({ ...content, toursPage: { ...content.toursPage, emptyWithToursTitle: v } })} />
            <Field label="Texto sin resultados" value={content.toursPage.emptyWithToursText} onChange={(v) => setContent({ ...content, toursPage: { ...content.toursPage, emptyWithToursText: v } })} multiline />
          </div>
        ) : null}

        {active === "about" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <SiteImageField label="Hero nosotros" value={content.about.heroImageUrl} onChange={(v) => setContent({ ...content, about: { ...content.about, heroImageUrl: v } })} />
            </div>
            <Field label="Badge hero" value={content.about.heroBadge} onChange={(v) => setContent({ ...content, about: { ...content.about, heroBadge: v } })} />
            <Field label="Título hero" value={content.about.heroTitle} onChange={(v) => setContent({ ...content, about: { ...content.about, heroTitle: v } })} />
            <Field label="Subtítulo hero" value={content.about.heroSubtitle} onChange={(v) => setContent({ ...content, about: { ...content.about, heroSubtitle: v } })} multiline />
            <Field label="Título historia" value={content.about.storyTitle} onChange={(v) => setContent({ ...content, about: { ...content.about, storyTitle: v } })} />
            <Field label="Párrafo 1" value={content.about.storyParagraph1} onChange={(v) => setContent({ ...content, about: { ...content.about, storyParagraph1: v } })} multiline />
            <Field label="Párrafo 2" value={content.about.storyParagraph2} onChange={(v) => setContent({ ...content, about: { ...content.about, storyParagraph2: v } })} multiline />
            {content.about.stats.map((stat, index) => (
              <div key={index} className="rounded-xl border border-outline-variant/20 p-4 space-y-2 md:col-span-1">
                <p className="text-xs font-semibold text-primary">Estadística {index + 1}</p>
                <Field label="Valor" value={stat.value} onChange={(v) => patchStat(index, { value: v })} />
                <Field label="Etiqueta" value={stat.label} onChange={(v) => patchStat(index, { label: v })} />
              </div>
            ))}
            {content.about.values.map((value, index) => (
              <div key={index} className="rounded-xl border border-outline-variant/20 p-4 space-y-2 md:col-span-2">
                <p className="text-xs font-semibold text-primary">Valor {index + 1}</p>
                <Field label="Título" value={value.title} onChange={(v) => patchValue(index, { title: v })} />
                <Field label="Descripción" value={value.description} onChange={(v) => patchValue(index, { description: v })} multiline />
              </div>
            ))}
            <Field label="Misión" value={content.about.missionText} onChange={(v) => setContent({ ...content, about: { ...content.about, missionText: v } })} multiline />
            <Field label="Visión" value={content.about.visionText} onChange={(v) => setContent({ ...content, about: { ...content.about, visionText: v } })} multiline />
            <Field label="CTA título" value={content.about.ctaTitle} onChange={(v) => setContent({ ...content, about: { ...content.about, ctaTitle: v } })} />
            <Field label="CTA texto" value={content.about.ctaText} onChange={(v) => setContent({ ...content, about: { ...content.about, ctaText: v } })} multiline />
          </div>
        ) : null}

        {active === "contact" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <SiteImageField label="Hero contacto" value={content.contactPage.heroImageUrl} onChange={(v) => setContent({ ...content, contactPage: { ...content.contactPage, heroImageUrl: v } })} />
            </div>
            <div className="md:col-span-2">
              <SiteImageField label="Imagen mapa" value={content.contact.mapImageUrl} onChange={(v) => setContent({ ...content, contact: { ...content.contact, mapImageUrl: v } })} aspectClass="aspect-[4/3]" />
            </div>
            <Field label="Título hero" value={content.contactPage.heroTitle} onChange={(v) => setContent({ ...content, contactPage: { ...content.contactPage, heroTitle: v } })} />
            <Field label="Subtítulo hero" value={content.contactPage.heroSubtitle} onChange={(v) => setContent({ ...content, contactPage: { ...content.contactPage, heroSubtitle: v } })} multiline />
            <Field label="Título formulario" value={content.contactPage.formTitle} onChange={(v) => setContent({ ...content, contactPage: { ...content.contactPage, formTitle: v } })} />
            <Field label="Título oficina" value={content.contactPage.officeTitle} onChange={(v) => setContent({ ...content, contactPage: { ...content.contactPage, officeTitle: v } })} />
          </div>
        ) : null}

        {active === "footer" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Facebook URL" value={content.social.facebook} onChange={(v) => setContent({ ...content, social: { ...content.social, facebook: v } })} />
            <Field label="Instagram URL" value={content.social.instagram} onChange={(v) => setContent({ ...content, social: { ...content.social, instagram: v } })} />
            <Field label="YouTube URL" value={content.social.youtube} onChange={(v) => setContent({ ...content, social: { ...content.social, youtube: v } })} />
            <Field label="Footer inicio" value={content.footer.homeDescription} onChange={(v) => setContent({ ...content, footer: { ...content.footer, homeDescription: v } })} multiline />
            <Field label="Footer tours" value={content.footer.toursDescription} onChange={(v) => setContent({ ...content, footer: { ...content.footer, toursDescription: v } })} multiline />
            <Field label="Footer detalle tour" value={content.footer.detailDescription} onChange={(v) => setContent({ ...content, footer: { ...content.footer, detailDescription: v } })} multiline />
            <Field label="Ubicación pie" value={content.footer.locationLabel} onChange={(v) => setContent({ ...content, footer: { ...content.footer, locationLabel: v } })} />
          </div>
        ) : null}

        {active === "pricing" ? (
          <div className="space-y-4 max-w-lg">
            <p className="text-sm text-on-surface-variant">
              La tasa de cambio (COP por 1 USD) se configura en{" "}
              <strong>Configuración → Catálogo de tours → Monedas → USD</strong>.
            </p>
            <Field
              label="Países que ven precios en COP (códigos ISO, separados por coma)"
              value={content.pricing.copCountryCodes.join(", ")}
              onChange={(v) =>
                setContent({
                  ...content,
                  pricing: {
                    ...content.pricing,
                    copCountryCodes: v
                      .split(",")
                      .map((c) => c.trim().toUpperCase())
                      .filter(Boolean),
                  },
                })
              }
            />
            <p className="text-sm text-on-surface-variant">
              Visitantes desde esos países (o con preferencia guardada) ven precios en pesos; el resto en dólares.
              Pueden cambiar COP/USD en el menú del sitio.
            </p>
          </div>
        ) : null}

        {active === "countries" ? (
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              Lista del buscador en la página de inicio. Se guarda en la base de datos.
            </p>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                placeholder="Agregar país"
                className="flex-1 rounded-xl border px-4 py-3"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const normalized = normalizeCountryName(newCountry);
                    if (!normalized) return;
                    if (!content.searchCountries.some((c) => c.toLowerCase() === normalized.toLowerCase())) {
                      setContent({ ...content, searchCountries: [...content.searchCountries, normalized] });
                    }
                    setNewCountry("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const normalized = normalizeCountryName(newCountry);
                  if (!normalized) return;
                  if (!content.searchCountries.some((c) => c.toLowerCase() === normalized.toLowerCase())) {
                    setContent({ ...content, searchCountries: [...content.searchCountries, normalized] });
                  }
                  setNewCountry("");
                }}
                className="rounded-xl bg-secondary-container px-5 py-3 text-sm font-semibold text-primary"
              >
                Agregar
              </button>
            </div>
            <ul className="space-y-2">
              {content.searchCountries.map((country, index) => (
                <li key={country} className="flex items-center justify-between rounded-xl border px-4 py-3">
                  <span className="font-medium text-primary">{country}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setContent({
                        ...content,
                        searchCountries: content.searchCountries.filter((_, i) => i !== index),
                      })
                    }
                    className="text-sm font-semibold text-red-600"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end gap-3 border-t border-outline-variant/15 px-6 py-4">
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-outline-variant/30 px-5 py-3 text-sm font-semibold text-primary"
        >
          Descartar cambios
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar sitio público"}
        </button>
      </div>
    </article>
  );
}
