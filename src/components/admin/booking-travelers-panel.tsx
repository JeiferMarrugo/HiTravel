"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PhoneField } from "@/components/phone-input";
import type { BookingGuestRecord, BookingRecord } from "@/lib/catalog/types";
import type { CatalogIdType } from "@/lib/catalog/id-types";
import { notify } from "@/lib/toast";

type GuestDraft = {
  fullName: string;
  idTypeId: string;
  idNumber: string;
  isChild: boolean;
};

type BookingTravelersPanelProps = {
  bookingId: string;
};

export function BookingTravelersPanel({ bookingId }: BookingTravelersPanelProps) {
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [guests, setGuests] = useState<GuestDraft[]>([]);
  const [idTypes, setIdTypes] = useState<CatalogIdType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerIdTypeId, setCustomerIdTypeId] = useState("");
  const [customerIdNumber, setCustomerIdNumber] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [guestsRes, idTypesRes] = await Promise.all([
        fetch(`/api/admin/bookings/${bookingId}/guests`, { cache: "no-store" }),
        fetch("/api/admin/id-types"),
      ]);
      const guestsPayload = (await guestsRes.json()) as {
        booking?: BookingRecord;
        guests?: BookingGuestRecord[];
        error?: string;
      };
      const idTypesPayload = (await idTypesRes.json()) as { idTypes?: CatalogIdType[] };

      if (!guestsRes.ok) {
        throw new Error(guestsPayload.error ?? "Error al cargar.");
      }

      const record = guestsPayload.booking ?? null;
      setBooking(record);
      if (record) {
        setCustomerName(record.customerName);
        setCustomerCity(record.customerCity ?? "");
        setCustomerPhone(record.customerPhoneE164 ?? record.customerPhone);
        setCustomerEmail(record.customerEmail ?? "");
        setCustomerIdTypeId(record.customerIdTypeId ?? "");
        setCustomerIdNumber(record.customerIdNumber ?? "");
      }

      setGuests(
        (guestsPayload.guests ?? []).map((guest) => ({
          fullName: guest.fullName,
          idTypeId: guest.idTypeId ?? "",
          idNumber: guest.idNumber ?? "",
          isChild: guest.isChild,
        })),
      );
      setIdTypes(idTypesPayload.idTypes ?? []);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar datos.");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  function addGuestSlot() {
    setGuests((current) => [
      ...current,
      { fullName: "", idTypeId: idTypes[0]?.id ?? "", idNumber: "", isChild: false },
    ]);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/guests`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking: {
            customerName,
            customerCity,
            customerPhone,
            customerEmail,
            customerIdTypeId,
            customerIdNumber,
          },
          guests,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo guardar.");
      }
      notify.success("Datos de viajeros guardados.");
      await load();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleAttended() {
    if (!booking) {
      return;
    }
    const attended = !booking.customerAttendedAt;
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/attended`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attended }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Error al actualizar.");
      }
      notify.success(attended ? "Marcado como cliente atendido." : "Se quitó la marca de atendido.");
      await load();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error.");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-on-surface-variant">Cargando datos de la reserva...</p>;
  }

  if (!booking) {
    return <p className="text-sm text-on-surface-variant">Reserva no encontrada.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/reservas"
          className="rounded-2xl border px-5 py-3 text-sm font-semibold text-primary"
        >
          ← Reservas
        </Link>
        <Link
          href={`/admin/reservas/${bookingId}`}
          className="rounded-2xl bg-secondary-container px-5 py-3 text-sm font-semibold text-primary"
        >
          Pagos
        </Link>
        <button
          type="button"
          onClick={() => void toggleAttended()}
          className={`rounded-2xl px-5 py-3 text-sm font-semibold ${
            booking.customerAttendedAt
              ? "bg-green-100 text-green-900"
              : "bg-amber-700 text-white"
          }`}
        >
          {booking.customerAttendedAt ? "Cliente atendido ✓" : "Marcar cliente atendido"}
        </button>
      </div>

      <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
        <h1 className="text-xl font-bold text-primary">
          {booking.bookingCode} · {booking.tourName}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {booking.adults} adultos · {booking.children} niños · Origen: {booking.bookingSource}
        </p>

        <h2 className="mt-6 text-lg font-semibold text-primary">Titular</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Nombre completo"
            className="rounded-xl border px-4 py-3 md:col-span-2"
          />
          <select
            value={customerIdTypeId}
            onChange={(event) => setCustomerIdTypeId(event.target.value)}
            className="rounded-xl border px-4 py-3"
          >
            <option value="">Tipo de ID</option>
            {idTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <input
            value={customerIdNumber}
            onChange={(event) => setCustomerIdNumber(event.target.value)}
            placeholder="Número de identificación"
            className="rounded-xl border px-4 py-3"
          />
          <input
            value={customerCity}
            onChange={(event) => setCustomerCity(event.target.value)}
            placeholder="Ciudad"
            className="rounded-xl border px-4 py-3"
          />
          <input
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="Correo"
            className="rounded-xl border px-4 py-3"
          />
          <div className="md:col-span-2 rounded-xl border px-2 py-1">
            <PhoneField value={customerPhone} onChange={setCustomerPhone} />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Acompañantes</h2>
          <button
            type="button"
            onClick={addGuestSlot}
            className="rounded-xl bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
          >
            + Agregar viajero
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {guests.map((guest, index) => (
            <div key={index} className="grid gap-2 rounded-xl border p-4 md:grid-cols-4">
              <input
                value={guest.fullName}
                onChange={(event) => {
                  const next = [...guests];
                  next[index] = { ...guest, fullName: event.target.value };
                  setGuests(next);
                }}
                placeholder="Nombre"
                className="rounded-lg border px-3 py-2 text-sm md:col-span-1"
              />
              <select
                value={guest.idTypeId}
                onChange={(event) => {
                  const next = [...guests];
                  next[index] = { ...guest, idTypeId: event.target.value };
                  setGuests(next);
                }}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                {idTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <input
                value={guest.idNumber}
                onChange={(event) => {
                  const next = [...guests];
                  next[index] = { ...guest, idNumber: event.target.value };
                  setGuests(next);
                }}
                placeholder="Número ID"
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={guest.isChild}
                  onChange={(event) => {
                    const next = [...guests];
                    next[index] = { ...guest, isChild: event.target.checked };
                    setGuests(next);
                  }}
                />
                Es niño
              </label>
            </div>
          ))}
          {!guests.length ? (
            <p className="text-sm text-on-surface-variant">Sin acompañantes registrados aún.</p>
          ) : null}
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar datos de viajeros"}
        </button>
      </article>
    </div>
  );
}
