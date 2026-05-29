import Link from "next/link";
import { TourFormSections } from "@/components/admin/tour-form-sections";
import { adminTourDetail } from "@/lib/admin/admin-tours-data";

type AdminTourEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminTourEditPage({ params }: AdminTourEditPageProps) {
  const { id } = await params;
  const isNew = id === "nuevo";

  return (
    <div className="w-full">
      <div className="mb-6 text-sm text-on-surface-variant">
        <Link href="/admin/tours" className="hover:text-primary">
          Tours
        </Link>
        <span className="mx-2">/</span>
        <span>{isNew ? "Nuevo tour" : "Editar tour"}</span>
      </div>

      <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">
            {isNew ? "Crear nuevo tour" : adminTourDetail.title}
          </h1>
          <p className="mt-2 text-lg text-on-surface-variant">
            {isNew
              ? "Configura la experiencia, precios y logística de un nuevo producto."
              : "Actualiza detalles, tarifas, imágenes e itinerario de esta experiencia destacada."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-2xl border border-outline-variant/30 bg-white px-5 py-3 text-sm font-semibold text-primary coastal-shadow">
            Descartar cambios
          </button>
          <button className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white coastal-shadow">
            {isNew ? "Crear tour" : "Guardar tour"}
          </button>
        </div>
      </section>

      <TourFormSections tour={adminTourDetail} />
    </div>
  );
}
