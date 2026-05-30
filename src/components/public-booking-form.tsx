"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PhoneField } from "@/components/phone-input";
import { formatMoneyDisplay } from "@/lib/catalog/money";
import { convertForDisplay, type DisplayCurrency } from "@/lib/pricing/display-currency";
import type { CatalogIdType } from "@/lib/catalog/id-types";
import { notify } from "@/lib/toast";

type PublicBookingFormProps = {
  tourSlug: string;
  tourName: string;
  storedCurrency: string;
  displayCurrency: DisplayCurrency;
  usdCopRate: number;
  initialAdults?: number;
  initialChildren?: number;
  initialCheckinAt?: string;
};

type GuestDraft = {
  fullName: string;
  idTypeId: string;
  idNumber: string;
  isChild: boolean;
};

type QuoteResponse = {
  totalCents: number;
  currency: string;
  error?: string;
};

export function PublicBookingForm({
  tourSlug,
  tourName,
  storedCurrency,
  displayCurrency,
  usdCopRate,
  initialAdults = 2,
  initialChildren = 0,
  initialCheckinAt = "",
}: PublicBookingFormProps) {
  const router = useRouter();
  const [idTypes, setIdTypes] = useState<CatalogIdType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [checkinAt, setCheckinAt] = useState(initialCheckinAt);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerIdTypeId, setCustomerIdTypeId] = useState("");
  const [customerIdNumber, setCustomerIdNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [guests, setGuests] = useState<GuestDraft[]>([]);

  const extraTravelers = Math.max(0, adults + children - 1);

  useEffect(() => {
    void fetch("/api/public/booking-options")
      .then((response) => response.json())
      .then((payload: { idTypes?: CatalogIdType[] }) => {
        const types = payload.idTypes ?? [];
        setIdTypes(types);
        if (types[0]) {
          setCustomerIdTypeId(types[0].id);
        }
      })
      .catch(() => notify.error("No se pudieron cargar los tipos de identificación."));
  }, []);

  useEffect(() => {
    setGuests((current) => {
      const next: GuestDraft[] = [];
      for (let index = 0; index < extraTravelers; index += 1) {
        next.push(
          current[index] ?? {
            fullName: "",
            idTypeId: idTypes[0]?.id ?? "",
            idNumber: "",
            isChild: index >= adults - 1,
          },
        );
      }
      return next;
    });
  }, [extraTravelers, adults, idTypes]);

  useEffect(() => {
    let cancelled = false;
    async function loadQuote() {
      const response = await fetch("/api/public/tour-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tourSlug, adults, children, checkinAt: checkinAt || undefined }),
      });
      const payload = (await response.json()) as QuoteResponse;
      if (!cancelled) {
        setQuote(response.ok ? payload : null);
      }
    }
    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [tourSlug, adults, children, checkinAt]);

  const totalLabel = useMemo(() => {
    if (!quote?.totalCents) {
      return null;
    }
    const converted = convertForDisplay(quote.totalCents, storedCurrency, displayCurrency, usdCopRate);
    return formatMoneyDisplay(converted.amountMinor, converted.currency);
  }, [quote, storedCurrency, displayCurrency, usdCopRate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!customerIdTypeId || !idTypes.some((type) => type.id === customerIdTypeId)) {
      notify.error("Selecciona un tipo de identificación válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourSlug,
          customerName,
          customerEmail,
          customerCity,
          customerPhone,
          customerIdTypeId,
          customerIdNumber,
          checkinAt,
          adults,
          children,
          notes,
          guests: guests
            .filter((guest) => guest.fullName.trim())
            .map((guest) => ({
              ...guest,
              idTypeId: guest.idTypeId && idTypes.some((t) => t.id === guest.idTypeId) ? guest.idTypeId : null,
            })),
        }),
      });

      const payload = (await response.json()) as { bookingCode?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo crear la reserva.");
      }

      router.push(`/reserva/${payload.bookingCode}`);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al reservar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-8">
      <div className="rounded-[2rem] bg-white p-6 coastal-shadow md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Reserva en línea</p>
        <h1 className="mt-2 text-2xl font-extrabold text-primary md:text-3xl">{tourName}</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Completa tus datos. Te contactaremos por WhatsApp al número real que indiques para confirmar pago y detalles.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Fecha del pasadía</label>
            <input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={checkinAt}
              onChange={(event) => setCheckinAt(event.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Adultos</label>
            <select
              value={adults}
              onChange={(event) => setAdults(Number(event.target.value))}
              className="w-full rounded-xl border px-4 py-3"
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Niños</label>
            <select
              value={children}
              onChange={(event) => setChildren(Number(event.target.value))}
              className="w-full rounded-xl border px-4 py-3"
            >
              {Array.from({ length: 6 }, (_, index) => index).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 coastal-shadow md:p-8">
        <h2 className="text-lg font-bold text-primary">Titular de la reserva</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-primary">Nombre completo</label>
            <input
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Tipo de identificación</label>
            <select
              required
              value={customerIdTypeId}
              onChange={(event) => setCustomerIdTypeId(event.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            >
              {idTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Número de identificación</label>
            <input
              required
              value={customerIdNumber}
              onChange={(event) => setCustomerIdNumber(event.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Ciudad</label>
            <input
              required
              value={customerCity}
              onChange={(event) => setCustomerCity(event.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Correo (opcional)</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-primary">WhatsApp / teléfono</label>
            <div className="rounded-xl border border-outline-variant/30 bg-white px-2 py-1">
              <PhoneField value={customerPhone} onChange={setCustomerPhone} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-amber-800">
              Usa tu número real con WhatsApp activo. Por ahí te escribiremos para finalizar tu reserva y coordinar el
              pago.
            </p>
          </div>
        </div>
      </div>

      {extraTravelers > 0 ? (
        <div className="rounded-[2rem] bg-white p-6 coastal-shadow md:p-8">
          <h2 className="text-lg font-bold text-primary">Acompañantes</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Registra los datos de las demás personas que viajan ({extraTravelers}).
          </p>
          <div className="mt-4 space-y-4">
            {guests.map((guest, index) => (
              <div key={index} className="rounded-xl border border-outline-variant/20 p-4">
                <p className="mb-3 text-sm font-semibold text-primary">
                  Viajero {index + 2} {guest.isChild ? "(niño)" : "(adulto)"}
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    placeholder="Nombre completo"
                    value={guest.fullName}
                    onChange={(event) => {
                      const next = [...guests];
                      next[index] = { ...guest, fullName: event.target.value };
                      setGuests(next);
                    }}
                    className="rounded-xl border px-3 py-2 text-sm md:col-span-1"
                  />
                  <select
                    value={guest.idTypeId}
                    onChange={(event) => {
                      const next = [...guests];
                      next[index] = { ...guest, idTypeId: event.target.value };
                      setGuests(next);
                    }}
                    className="rounded-xl border px-3 py-2 text-sm"
                  >
                    {idTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Número de ID"
                    value={guest.idNumber}
                    onChange={(event) => {
                      const next = [...guests];
                      next[index] = { ...guest, idNumber: event.target.value };
                      setGuests(next);
                    }}
                    className="rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-[2rem] bg-primary p-6 text-on-primary md:p-8">
        <label className="mb-2 block text-sm font-semibold">Notas o solicitudes (opcional)</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-on-primary placeholder:text-on-primary/50"
        />
        {totalLabel ? (
          <p className="mt-6 text-2xl font-extrabold">
            Total estimado: <span className="text-secondary-container">{totalLabel}</span>
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-secondary-container py-4 text-lg font-bold text-on-secondary-container disabled:opacity-60"
        >
          {isSubmitting ? "Enviando reserva..." : "Confirmar solicitud de reserva"}
        </button>
      </div>
    </form>
  );
}
