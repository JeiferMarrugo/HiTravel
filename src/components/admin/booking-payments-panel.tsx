"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { BookingWhatsAppActions } from "@/components/admin/booking-whatsapp-actions";
import { formatMoneyDisplay, moneyInputHint } from "@/lib/catalog/money";
import {
  PAYMENT_METHOD_OPTIONS,
  type BookingPaymentRecord,
  type BookingRecord,
  type BookingWithPayments,
  type PaymentMethod,
} from "@/lib/catalog/types";
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

type PaymentForm = {
  amount: string;
  paymentMethod: PaymentMethod;
  reference: string;
  voucherUrl: string;
  notes: string;
  paidAt: string;
};

const emptyPaymentForm = (): PaymentForm => ({
  amount: "",
  paymentMethod: "consignacion",
  reference: "",
  voucherUrl: "",
  notes: "",
  paidAt: "",
});

type BookingPaymentsPanelProps = {
  bookingId: string;
};

export function BookingPaymentsPanel({ bookingId }: BookingPaymentsPanelProps) {
  const [data, setData] = useState<BookingWithPayments | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState(emptyPaymentForm);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/payments`, { cache: "no-store" });
      const payload = (await response.json()) as BookingWithPayments & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Error al cargar.");
      }
      setData(payload);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar pagos.");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function uploadVoucher(file: File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "payments");
      const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Error al subir comprobante.");
      }
      setForm((current) => ({ ...current, voucherUrl: payload.url! }));
      notify.success("Comprobante cargado.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al subir.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(form.amount),
          paymentMethod: form.paymentMethod,
          reference: form.reference || undefined,
          voucherUrl: form.voucherUrl || undefined,
          notes: form.notes || undefined,
          paidAt: form.paidAt || undefined,
        }),
      });
      const payload = (await response.json()) as BookingWithPayments & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No fue posible registrar el pago.");
      }
      setData(payload);
      setForm(emptyPaymentForm());
      notify.success("Pago registrado.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removePayment(paymentId: string) {
    if (!window.confirm("¿Eliminar este abono? El saldo de la reserva se recalculará.")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/payments/${paymentId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as BookingWithPayments & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Error al eliminar.");
      }
      setData(payload);
      notify.success("Pago eliminado.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al eliminar.");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-on-surface-variant">Cargando pagos...</p>;
  }

  if (!data) {
    return (
      <p className="text-sm text-on-surface-variant">
        No se encontró la reserva.{" "}
        <Link href="/admin/reservas" className="font-semibold text-primary">
          Volver al listado
        </Link>
      </p>
    );
  }

  const { booking, payments } = data;
  const total = booking.amountCents;
  const paid = booking.paidCents;
  const balance = booking.balanceCents;
  const progress =
    total && total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : paid > 0 ? 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/reservas"
          className="rounded-2xl border border-outline-variant/30 bg-white px-5 py-3 text-sm font-semibold text-primary"
        >
          ← Reservas
        </Link>
      </div>

      <article className="rounded-[2rem] bg-white p-6 coastal-shadow space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">{booking.bookingCode}</p>
            <h1 className="text-2xl font-bold text-primary">{booking.customerName}</h1>
            <p className="text-sm text-on-surface-variant">{booking.tourName}</p>
            <p className="mt-1 text-sm text-on-surface-variant">Check-in: {formatDate(booking.checkinAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-col gap-1">
              <BookingStatusBadge status={booking.paymentStatus} />
              <BookingStatusBadge status={booking.approvalStatus} />
              {booking.experienceCompletedAt ? (
                <span className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                  Pasadía disfrutado
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <BookingWhatsAppActions booking={booking} onUpdated={() => void load()} compact />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-container-low p-4">
            <p className="text-xs text-on-surface-variant">Total reserva</p>
            <p className="text-xl font-bold text-primary">{formatMoneyDisplay(total, booking.currency)}</p>
          </div>
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-xs text-green-800">Pagado</p>
            <p className="text-xl font-bold text-green-800">{formatMoneyDisplay(paid, booking.currency)}</p>
          </div>
          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-xs text-orange-800">Saldo pendiente</p>
            <p className="text-xl font-bold text-orange-800">
              {balance !== null ? formatMoneyDisplay(balance, booking.currency) : "Sin total definido"}
            </p>
          </div>
        </div>

        {total && total > 0 ? (
          <div>
            <div className="mb-1 flex justify-between text-xs font-medium text-on-surface-variant">
              <span>Progreso de pago</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </article>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 coastal-shadow space-y-4">
          <h2 className="text-lg font-semibold text-primary">Registrar abono</h2>
          <p className="text-sm text-on-surface-variant">
            Cada pago se descuenta del saldo de la reserva. {moneyInputHint(booking.currency)}
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">Monto *</label>
            <input
              required
              type="number"
              min="1"
              step="any"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full rounded-xl border px-4 py-3"
              placeholder={booking.currency === "USD" ? "120" : "450000"}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">Método de pago *</label>
            <select
              required
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
              className="w-full rounded-xl border px-4 py-3"
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">Referencia / No. transacción</label>
            <input
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="Ej. 123456789"
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">Fecha del pago</label>
            <input
              type="datetime-local"
              value={form.paidAt}
              onChange={(e) => setForm({ ...form, paidAt: e.target.value })}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">Comprobante (voucher)</label>
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer rounded-xl bg-secondary-container px-4 py-2 text-sm font-semibold text-primary">
                {isUploading ? "Subiendo..." : "Subir imagen"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadVoucher(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {form.voucherUrl ? (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, voucherUrl: "" })}
                  className="text-sm font-semibold text-red-600"
                >
                  Quitar
                </button>
              ) : null}
            </div>
            <input
              value={form.voucherUrl}
              onChange={(e) => setForm({ ...form, voucherUrl: e.target.value })}
              placeholder="URL del comprobante (opcional si subes archivo)"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
            />
            {form.voucherUrl && form.voucherUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
              <div className="relative mt-2 h-40 w-full max-w-xs overflow-hidden rounded-xl border">
                <Image src={form.voucherUrl} alt="Voucher" fill className="object-cover" unoptimized />
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">Notas</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Registrar pago"}
          </button>
        </form>

        <div className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <h2 className="mb-4 text-lg font-semibold text-primary">Historial de pagos</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Aún no hay abonos registrados.</p>
          ) : (
            <ul className="space-y-4">
              {payments.map((payment) => (
                <PaymentHistoryItem
                  key={payment.id}
                  payment={payment}
                  currency={booking.currency}
                  onDelete={() => void removePayment(payment.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentHistoryItem({
  payment,
  currency,
  onDelete,
}: {
  payment: BookingPaymentRecord;
  currency: string;
  onDelete: () => void;
}) {
  return (
    <li className="rounded-xl border border-outline-variant/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-primary">{formatMoneyDisplay(payment.amountCents, currency)}</p>
          <p className="text-sm text-on-surface-variant">{methodLabel(payment.paymentMethod)}</p>
          {payment.reference ? (
            <p className="text-xs text-on-surface-variant">Ref: {payment.reference}</p>
          ) : null}
          <p className="text-xs text-on-surface-variant">{formatDate(payment.paidAt)}</p>
          {payment.notes ? <p className="mt-1 text-sm">{payment.notes}</p> : null}
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs font-semibold text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </div>
      {payment.voucherUrl ? (
        <a
          href={payment.voucherUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          Ver comprobante
        </a>
      ) : null}
    </li>
  );
}
