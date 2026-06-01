import { GuestsOverview } from "@/components/admin/guests-overview";
import Link from "next/link";

export default function AdminGuestsPage() {
  return (
    <div className="w-full">
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Huéspedes</h1>
          <p className="mt-2 text-lg text-on-surface-variant">
            Titulares y acompañantes de todas las reservas. Incluye datos de identificación y enlace a cada reserva.
          </p>
        </div>
        <Link
          href="/admin/reservas"
          className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-primary"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver a reservas
        </Link>
      </section>
      <GuestsOverview />
    </div>
  );
}
