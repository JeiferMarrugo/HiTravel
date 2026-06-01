import { notFound } from "next/navigation";
import { TourEditor } from "@/components/admin/tour-editor";
import { getActiveCatalogOptions } from "@/lib/catalog/catalog-options";
import { getTourById } from "@/lib/catalog/tours";

export const dynamic = "force-dynamic";

type AdminTourEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminTourEditPage({ params }: AdminTourEditPageProps) {
  const { id } = await params;
  const isNew = id === "nuevo";
  const [catalog, tour] = await Promise.all([
    getActiveCatalogOptions(),
    isNew ? Promise.resolve(null) : getTourById(id),
  ]);

  if (!isNew && !tour) {
    notFound();
  }

  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">
          {isNew ? "Crear experiencia" : "Editar experiencia"}
        </h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Configura nombre, tipo, descripciones, imágenes, itinerario, inclusiones y precios.
        </p>
      </section>
      <TourEditor
        tourId={isNew ? undefined : id}
        isNew={isNew}
        initialCatalog={catalog}
        initialTour={tour ?? undefined}
      />
    </div>
  );
}
