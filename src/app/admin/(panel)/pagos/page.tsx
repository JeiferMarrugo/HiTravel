import { PaymentsOverview } from "@/components/admin/payments-overview";

export const dynamic = "force-dynamic";

export default function AdminPaymentsPage() {
  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Pagos y caja</h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Todos los abonos registrados, comprobantes y reporte de caja por método y moneda.
        </p>
      </section>
      <PaymentsOverview />
    </div>
  );
}
