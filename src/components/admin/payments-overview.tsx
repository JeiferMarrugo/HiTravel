"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatMoneyDisplay } from "@/lib/catalog/money";
import type { PaymentListItem, PaymentsCashReport } from "@/lib/catalog/payments";
import { PAYMENT_METHOD_OPTIONS, type PaymentMethod } from "@/lib/catalog/types";
import { notify } from "@/lib/toast";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function methodLabel(method: PaymentMethod) {
  return PAYMENT_METHOD_OPTIONS.find((item) => item.value === method)?.label ?? method;
}

type Filters = {
  from: string;
  to: string;
  method: string;
  currency: string;
};

const emptyFilters = (): Filters => ({
  from: "",
  to: "",
  method: "",
  currency: "",
});

export function PaymentsOverview() {
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [report, setReport] = useState<PaymentsCashReport | null>(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (nextFilters: Filters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextFilters.from) params.set("from", nextFilters.from);
      if (nextFilters.to) params.set("to", nextFilters.to);
      if (nextFilters.method) params.set("method", nextFilters.method);
      if (nextFilters.currency) params.set("currency", nextFilters.currency);

      const query = params.toString();
      const response = await fetch(`/api/admin/payments${query ? `?${query}` : ""}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        payments: PaymentListItem[];
        report: PaymentsCashReport;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Error al cargar pagos.");
      }
      setPayments(payload.payments);
      setReport(payload.report);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(applied);
  }, [applied, load]);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    setApplied({ ...filters });
  }

  function clearFilters() {
    const cleared = emptyFilters();
    setFilters(cleared);
    setApplied(cleared);
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={applyFilters}
        className="flex flex-wrap items-end gap-4 rounded-[2rem] bg-white p-6 coastal-shadow"
      >
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Desde</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="rounded-xl border px-4 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Hasta</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="rounded-xl border px-4 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Método</label>
          <select
            value={filters.method}
            onChange={(e) => setFilters({ ...filters, method: e.target.value })}
            className="rounded-xl border px-4 py-2"
          >
            <option value="">Todos</option>
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Moneda</label>
          <select
            value={filters.currency}
            onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
            className="rounded-xl border px-4 py-2"
          >
            <option value="">Todas</option>
            <option value="COP">COP</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <button type="submit" className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white">
          Filtrar
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-outline-variant/40 px-5 py-2 text-sm font-semibold text-on-surface-variant"
        >
          Limpiar
        </button>
      </form>

      {report ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 coastal-shadow">
            <p className="text-sm text-on-surface-variant">Abonos registrados</p>
            <p className="mt-2 text-2xl font-bold text-primary">{report.totalCount}</p>
          </div>
          {report.totalsByCurrency.map((item) => (
            <div key={item.currency} className="rounded-2xl bg-green-50 p-5 coastal-shadow">
              <p className="text-sm text-green-800">Total recaudado ({item.currency})</p>
              <p className="mt-2 text-2xl font-bold text-green-800">
                {formatMoneyDisplay(item.totalCents, item.currency)}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {report && report.totalsByMethod.length > 0 ? (
        <section className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <h2 className="mb-4 text-lg font-semibold text-primary">Reporte de caja por método</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-outline-variant/20">
                <tr>
                  <th className="px-3 py-2">Método</th>
                  <th className="px-3 py-2">Moneda</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {report.totalsByMethod.map((row) => (
                  <tr key={`${row.paymentMethod}-${row.currency}`} className="border-b border-outline-variant/10">
                    <td className="px-3 py-3">{methodLabel(row.paymentMethod)}</td>
                    <td className="px-3 py-3">{row.currency}</td>
                    <td className="px-3 py-3">{row.count}</td>
                    <td className="px-3 py-3 font-semibold text-primary">
                      {formatMoneyDisplay(row.totalCents, row.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-on-surface-variant">Cargando pagos...</p>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] bg-white coastal-shadow">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-outline-variant/20 bg-surface-container-low">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Reserva</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tour</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Comprobante</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-outline-variant/10">
                  <td className="px-4 py-4">{formatDate(payment.paidAt)}</td>
                  <td className="px-4 py-4 font-semibold text-primary">{payment.bookingCode}</td>
                  <td className="px-4 py-4">{payment.customerName}</td>
                  <td className="px-4 py-4">{payment.tourName}</td>
                  <td className="px-4 py-4 font-semibold">
                    {formatMoneyDisplay(payment.amountCents, payment.currency)}
                  </td>
                  <td className="px-4 py-4">{methodLabel(payment.paymentMethod)}</td>
                  <td className="px-4 py-4">
                    {payment.voucherUrl ? (
                      <a
                        href={payment.voucherUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary underline"
                      >
                        Ver voucher
                      </a>
                    ) : (
                      <span className="text-on-surface-variant">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/reservas/${payment.bookingId}`}
                      className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary"
                    >
                      Ver reserva
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!payments.length ? (
            <p className="p-8 text-center text-on-surface-variant">
              No hay pagos registrados con estos filtros.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
