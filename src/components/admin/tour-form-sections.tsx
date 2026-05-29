import Image from "next/image";
import type { AdminTourDetail } from "@/lib/admin/types";

type TourFormSectionsProps = {
  tour: AdminTourDetail;
};

function SectionCard({
  title,
  icon,
  badge,
  children,
}: {
  title: string;
  icon: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-6 coastal-shadow">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </div>
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
        </div>
        {badge ? <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">{badge}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function TourFormSections({ tour }: TourFormSectionsProps) {
  return (
    <div className="space-y-6">
      <SectionCard title="Información básica" icon="info">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-on-surface-variant">Título del tour</label>
            <input
              defaultValue={tour.title}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface-variant">Categoría</label>
              <input
                defaultValue={tour.category}
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface-variant">Duración</label>
              <input
                defaultValue={tour.duration}
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-on-surface-variant">Descripción</label>
            <textarea
              rows={4}
              defaultValue={tour.description}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Galería multimedia" icon="images" badge={`${tour.media.length}/12 imágenes`}>
        <div className="rounded-[1.5rem] border border-dashed border-outline-variant/40 bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          Haz clic para subir o arrastra imágenes aquí
          <br />
          <span className="text-xs">SVG, PNG, JPG o WebP</span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tour.media.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl bg-surface-container-low">
              <div className="relative h-28">
                <Image src={item.image} alt={item.label} fill className="object-cover" sizes="25vw" />
                <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Tarifas por temporada" icon="table_chart">
        <div className="overflow-hidden rounded-[1.5rem] border border-outline-variant/20">
          <table className="min-w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Temporada</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Adulto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Niño</th>
              </tr>
            </thead>
            <tbody>
              {tour.pricing.map((season) => (
                <tr key={season.id} className="border-t border-outline-variant/15">
                  <td className="px-4 py-4">{season.season}</td>
                  <td className="px-4 py-4">{season.adultPrice}</td>
                  <td className="px-4 py-4">{season.childPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Itinerario diario" icon="schedule">
        <div className="space-y-4">
          {tour.itinerary.map((step) => (
            <div key={step.id} className="rounded-[1.5rem] border border-outline-variant/20 p-4">
              <div className="grid gap-3 md:grid-cols-[140px_1fr]">
                <input
                  defaultValue={step.time}
                  className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
                />
                <div className="space-y-3">
                  <input
                    defaultValue={step.title}
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
                  />
                  <textarea
                    rows={2}
                    defaultValue={step.description}
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Qué incluye" icon="checklist">
        <div className="grid gap-3 md:grid-cols-2">
          {tour.included.map((item) => (
            <label key={item} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-4">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-outline-variant text-primary" />
              <span className="text-sm text-on-surface">{item}</span>
            </label>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
