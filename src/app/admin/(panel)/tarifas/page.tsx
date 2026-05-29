import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { rateSummaryCards, rateTable } from "@/lib/admin/rates-data";

export default function AdminRatesPage() {
  const rows = rateTable.map((season) => [
    <div key={`${season.id}-season`} className="font-medium text-primary">
      {season.season}
    </div>,
    <span key={`${season.id}-adult`}>{season.adultPrice}</span>,
    <span key={`${season.id}-child`}>{season.childPrice}</span>,
    <div key={`${season.id}-actions`} className="flex gap-2">
      <button className="rounded-xl bg-surface-container px-3 py-2 text-xs font-medium text-primary">Editar</button>
      <button className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">Eliminar</button>
    </div>,
  ]);

  return (
    <div className="w-full">
      <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Tarifas y temporadas</h1>
          <p className="mt-2 text-lg text-on-surface-variant">
            Revisa valores por temporada y mantén alineados los precios de cada experiencia.
          </p>
        </div>

        <button className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white coastal-shadow">
          + Agregar temporada
        </button>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rateSummaryCards.map((card) => (
          <StatCard
            key={card.label}
            stat={{
              label: card.label,
              value: card.value,
              icon: card.icon,
            }}
          />
        ))}
      </section>

      <section>
        <DataTable
          headers={["Temporada", "Tarifa adulto", "Tarifa niño", "Acciones"]}
          rows={rows}
          footer={<p className="text-sm text-on-surface-variant">Las tarifas aquí mostradas son datos demo para validación visual.</p>}
        />
      </section>
    </div>
  );
}
