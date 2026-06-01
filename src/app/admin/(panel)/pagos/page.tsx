import { PaymentsOverview } from "@/components/admin/payments-overview";
import { getPaymentsCashReport, listAllPayments } from "@/lib/catalog/payments";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const [payments, report] = await Promise.all([listAllPayments({}), getPaymentsCashReport({})]);

  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Pagos y caja</h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Todos los abonos registrados, comprobantes y reporte de caja por método y moneda.
        </p>
      </section>
      <PaymentsOverview initialPayments={payments} initialReport={report} />
    </div>
  );
}
