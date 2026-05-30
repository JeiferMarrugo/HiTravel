"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { BookingWhatsAppActions } from "@/components/admin/booking-whatsapp-actions";
import { formatMoneyDisplay } from "@/lib/catalog/money";
import { promotionTypeLabel } from "@/lib/catalog/promotion-types";
import type {
  ApprovalStatus,
  BookingRecord,
  PaymentStatus,
  PromotionRecord,
  TourListItem,
} from "@/lib/catalog/types";
import { notify } from "@/lib/toast";

const toneClasses = ["bg-blue-100 text-primary", "bg-secondary-container text-primary", "bg-primary text-white", "bg-yellow-800 text-white"];

function customerCode(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type BookingForm = {
  tourId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  checkinAt: string;
  amountCents: string;
  currency: string;
  adults: string;
  children: string;
  paymentStatus: PaymentStatus;
  approvalStatus: ApprovalStatus;
  notes: string;
  promotionIds: string[];
  subtotalCents: string;
  discountCents: string;
};

type StatusFilter = "all" | "pending" | "confirmed" | "cancelled" | "attended";

const filterLabels: Record<StatusFilter, string> = {
  all: "Todas",
  pending: "Pendientes",
  confirmed: "Confirmadas",
  cancelled: "Canceladas",
  attended: "Clientes atendidos",
};

const emptyForm = (): BookingForm => ({
  tourId: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  checkinAt: "",
  amountCents: "",
  currency: "COP",
  adults: "1",
  children: "0",
  paymentStatus: "pending",
  approvalStatus: "pending",
  notes: "",
  promotionIds: [],
  subtotalCents: "",
  discountCents: "",
});

export function BookingsManager() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [tours, setTours] = useState<TourListItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pendingApproval: 0,
    confirmed: 0,
    cancelled: 0,
    attended: 0,
    travelersAttended: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [form, setForm] = useState(emptyForm());
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [pricePreview, setPricePreview] = useState<string | null>(null);

  const visibleBookings =
    statusFilter === "all"
      ? bookings
      : statusFilter === "attended"
        ? bookings.filter((booking) => Boolean(booking.customerAttendedAt))
        : bookings.filter((booking) => booking.approvalStatus === statusFilter);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, toursRes, promosRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/tours"),
        fetch("/api/admin/promotions?active=1"),
      ]);

      const bookingsData = (await bookingsRes.json()) as {
        bookings: BookingRecord[];
        stats: typeof stats;
        error?: string;
      };
      const toursData = (await toursRes.json()) as { tours: TourListItem[] };
      const promosData = (await promosRes.json()) as { promotions: PromotionRecord[] };

      if (!bookingsRes.ok) {
        throw new Error(bookingsData.error ?? "Error al cargar reservas.");
      }

      setBookings(bookingsData.bookings);
      setStats(bookingsData.stats);
      setTours(toursData.tours ?? []);
      setPromotions(promosData.promotions ?? []);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function togglePromotion(promotionId: string) {
    setForm((current) => {
      const has = current.promotionIds.includes(promotionId);
      return {
        ...current,
        promotionIds: has
          ? current.promotionIds.filter((id) => id !== promotionId)
          : [...current.promotionIds, promotionId],
      };
    });
    setPricePreview(null);
  }

  async function applyPromotion() {
    if (!form.promotionIds.length || !form.tourId || !form.checkinAt) {
      notify.error("Selecciona tour, fecha y al menos una promoción.");
      return;
    }
    try {
      const response = await fetch("/api/admin/promotions/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotionIds: form.promotionIds,
          tourId: form.tourId,
          checkinAt: form.checkinAt,
          adults: Number(form.adults),
          children: Number(form.children),
        }),
      });
      const data = (await response.json()) as {
        subtotalCents: number;
        discountCents: number;
        totalCents: number;
        currency: string;
        descriptions: string[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo calcular.");
      }
      const displayTotal =
        data.currency === "USD" ? data.totalCents / 100 : data.totalCents;
      setForm({
        ...form,
        currency: data.currency,
        amountCents: String(displayTotal),
        subtotalCents: String(data.subtotalCents),
        discountCents: String(data.discountCents),
      });
      setPricePreview(
        `Subtotal ${formatMoneyDisplay(data.subtotalCents, data.currency)} · Descuento ${formatMoneyDisplay(data.discountCents, data.currency)}${data.descriptions?.length ? ` · ${data.descriptions.join(" · ")}` : ""}`,
      );
      notify.success("Monto calculado con las promociones combinadas.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al calcular.");
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amountCents: form.amountCents ? Number(form.amountCents) : undefined,
          adults: Number(form.adults),
          children: Number(form.children),
          promotionIds: form.promotionIds,
          subtotalCents: form.subtotalCents ? Number(form.subtotalCents) : undefined,
          discountCents: form.discountCents ? Number(form.discountCents) : undefined,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible crear la reserva.");
      }
      notify.success("Reserva creada.");
      setShowForm(false);
      setForm(emptyForm());
      setPricePreview(null);
      await load();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al crear.");
    }
  }

  async function removeBooking(id: string) {
    if (!window.confirm("¿Eliminar esta reserva? No se puede deshacer.")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Error al eliminar.");
      }
      notify.success("Reserva eliminada.");
      await load();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al eliminar.");
    }
  }

  async function patchBooking(id: string, patch: Partial<BookingRecord>) {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await response.json()) as {
        error?: string;
        whatsapp?: { sent: boolean; skipped?: boolean; reason?: string; error?: string };
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Error al actualizar.");
      }
      if (patch.approvalStatus === "confirmed") {
        if (data.whatsapp?.sent) {
          notify.success("Reserva confirmada. WhatsApp enviado al cliente.");
        } else if (data.whatsapp?.skipped) {
          notify.success(`Reserva confirmada. ${data.whatsapp.reason ?? "WhatsApp no enviado."}`);
        } else if (data.whatsapp?.error) {
          notify.error(`Reserva confirmada, pero WhatsApp falló: ${data.whatsapp.error}`);
        } else {
          notify.success("Reserva confirmada.");
        }
      } else {
        notify.success("Reserva actualizada.");
      }
      await load();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al actualizar.");
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 coastal-shadow">
          <p className="text-sm text-on-surface-variant">Total reservas</p>
          <p className="mt-2 text-2xl font-bold text-primary">{stats.total}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 coastal-shadow">
          <p className="text-sm text-on-surface-variant">Pendientes</p>
          <p className="mt-2 text-2xl font-bold text-primary">{stats.pendingApproval}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 coastal-shadow">
          <p className="text-sm text-on-surface-variant">Confirmadas</p>
          <p className="mt-2 text-2xl font-bold text-primary">{stats.confirmed}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 coastal-shadow">
          <p className="text-sm text-on-surface-variant">Clientes atendidos</p>
          <p className="mt-2 text-2xl font-bold text-primary">{stats.attended}</p>
          <p className="text-xs text-on-surface-variant">{stats.travelersAttended} viajeros</p>
        </div>
        <div className="rounded-2xl bg-white p-5 coastal-shadow">
          <p className="text-sm text-on-surface-variant">Canceladas</p>
          <p className="mt-2 text-2xl font-bold text-primary">{stats.cancelled}</p>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(filterLabels) as StatusFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                statusFilter === key
                  ? "bg-primary text-white"
                  : "bg-white text-primary border border-outline-variant/30"
              }`}
            >
              {filterLabels[key]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
        >
          {showForm ? "Cerrar formulario" : "+ Nueva reserva"}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="rounded-[2rem] bg-white p-6 coastal-shadow space-y-4">
          <h2 className="text-lg font-semibold text-primary">Nueva reserva</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-on-surface-variant">Tour / paquete *</label>
              <select
                required
                value={form.tourId}
                onChange={(e) => setForm({ ...form, tourId: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              >
                <option value="">Seleccionar...</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Cliente *</label>
              <input
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Teléfono WhatsApp *</label>
              <input
                required
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="573001234567"
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Email</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Check-in / salida *</label>
              <input
                required
                type="datetime-local"
                value={form.checkinAt}
                onChange={(e) => setForm({ ...form, checkinAt: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Promociones (puedes combinar varias: adultos, niños y descuentos)
              </label>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-outline-variant/30 p-3 space-y-2">
                {!promotions.length ? (
                  <p className="text-sm text-on-surface-variant">No hay promociones activas.</p>
                ) : (
                  promotions.map((promo) => (
                    <label
                      key={promo.id}
                      className="flex cursor-pointer items-start gap-2 rounded-lg p-2 hover:bg-surface-container-low"
                    >
                      <input
                        type="checkbox"
                        checked={form.promotionIds.includes(promo.id)}
                        onChange={() => togglePromotion(promo.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-medium text-primary">{promo.name}</span>
                        <span className="block text-xs text-on-surface-variant">
                          {promotionTypeLabel(promo.promotionType)}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void applyPromotion()}
                  disabled={!form.promotionIds.length}
                  className="rounded-xl bg-secondary-container px-4 py-3 text-sm font-semibold text-primary disabled:opacity-50"
                >
                  Calcular monto combinado
                </button>
                {form.promotionIds.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, promotionIds: [] });
                      setPricePreview(null);
                    }}
                    className="rounded-xl border px-4 py-3 text-sm font-semibold text-on-surface-variant"
                  >
                    Quitar promociones
                  </button>
                ) : null}
              </div>
              {pricePreview ? (
                <p className="mt-2 text-xs text-green-800">{pricePreview}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">
                Monto total de la reserva ({form.currency === "USD" ? "dólares" : "pesos"})
              </label>
              <input
                type="number"
                value={form.amountCents}
                onChange={(e) => setForm({ ...form, amountCents: e.target.value })}
                placeholder={form.currency === "USD" ? "120" : "450000"}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Adultos</label>
              <input
                type="number"
                min={1}
                value={form.adults}
                onChange={(e) => setForm({ ...form, adults: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Niños</label>
              <input
                type="number"
                min={0}
                value={form.children}
                onChange={(e) => setForm({ ...form, children: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
          </div>
          <button type="submit" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
            Guardar reserva
          </button>
        </form>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-on-surface-variant">Cargando reservas...</p>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] bg-white coastal-shadow">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-outline-variant/20 bg-surface-container-low">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tour</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Pagado / Saldo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((booking, index) => (
                <tr key={booking.id} className="border-b border-outline-variant/10">
                  <td className="px-4 py-4 font-semibold text-primary">{booking.bookingCode}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${toneClasses[index % toneClasses.length]}`}>
                        {customerCode(booking.customerName)}
                      </span>
                      <div>
                        <p>{booking.customerName}</p>
                        <p className="text-xs text-on-surface-variant">{booking.customerPhone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">{booking.tourName}</td>
                  <td className="px-4 py-4">{formatDate(booking.checkinAt)}</td>
                  <td className="px-4 py-4">
                    <p>{formatMoneyDisplay(booking.amountCents, booking.currency)}</p>
                    {booking.appliedPromotions?.length ? (
                      <div className="text-xs text-green-700 space-y-0.5">
                        {booking.appliedPromotions.map((promo) => (
                          <p key={promo.promotionId}>
                            {promo.promotionName}
                            {promo.discountCents > 0
                              ? ` (-${formatMoneyDisplay(promo.discountCents, booking.currency)})`
                              : ""}
                          </p>
                        ))}
                      </div>
                    ) : booking.promotionName ? (
                      <p className="text-xs text-green-700">{booking.promotionName}</p>
                    ) : null}
                    {booking.discountCents > 0 ? (
                      <p className="text-xs text-on-surface-variant">
                        -{formatMoneyDisplay(booking.discountCents, booking.currency)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-green-700">{formatMoneyDisplay(booking.paidCents, booking.currency)}</p>
                    <p className="text-xs text-on-surface-variant">
                      Saldo: {formatMoneyDisplay(booking.balanceCents, booking.currency)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <BookingStatusBadge status={booking.paymentStatus} />
                      <BookingStatusBadge status={booking.approvalStatus} />
                      {booking.customerAttendedAt ? (
                        <span className="inline-flex w-fit rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-900">
                          Atendido
                        </span>
                      ) : null}
                      {booking.experienceCompletedAt ? (
                        <span className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                          Pasadía disfrutado
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/reservas/${booking.id}/datos`}
                        className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        Datos viajeros
                      </Link>
                      <Link
                        href={`/admin/reservas/${booking.id}`}
                        className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary"
                      >
                        Pagos
                      </Link>
                      {booking.approvalStatus === "pending" ? (
                        <button
                          type="button"
                          onClick={() => void patchBooking(booking.id, { approvalStatus: "confirmed" })}
                          className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                        >
                          Confirmar
                        </button>
                      ) : null}
                      <BookingWhatsAppActions booking={booking} onUpdated={() => void load()} compact />
                      <button
                        type="button"
                        onClick={() => void removeBooking(booking.id)}
                        className="rounded-full border border-outline-variant/40 px-3 py-1 text-xs font-semibold text-on-surface-variant"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleBookings.length ? (
            <p className="p-8 text-center text-on-surface-variant">
              {bookings.length
                ? `No hay reservas ${filterLabels[statusFilter].toLowerCase()}. Cambia el filtro o crea una nueva.`
                : "No hay reservas en la base de datos. Crea la primera arriba."}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
