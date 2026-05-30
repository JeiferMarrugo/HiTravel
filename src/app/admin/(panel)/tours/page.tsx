import Link from "next/link";
import { ToursInventory } from "@/components/admin/tours-inventory";

export default function AdminToursPage() {
  return (
    <div className="w-full">
      <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Inventario de tours y paquetes</h1>
          <p className="mt-2 max-w-3xl text-lg text-on-surface-variant">
            Pasadías, paquetes y experiencias publicadas en el sitio. Todo se guarda en la base de datos con fotos,
            descripciones, itinerario e inclusiones.
          </p>
        </div>
        <Link
          href="/admin/tours/nuevo"
          className="rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-white coastal-shadow"
        >
          + Agregar experiencia
        </Link>
      </section>
      <ToursInventory />
    </div>
  );
}
