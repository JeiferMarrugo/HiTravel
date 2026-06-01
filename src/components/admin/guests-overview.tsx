"use client";

import { adminFetch } from "@/lib/admin/admin-fetch";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import type { TravelerOverviewItem } from "@/lib/catalog/guests-overview";
import type { ApprovalStatus } from "@/lib/catalog/types";
import { notify } from "@/lib/toast";

const roleLabels: Record<TravelerOverviewItem["travelerRole"], string> = {
  titular: "Titular",
  acompanante: "Acompañante",
  nino: "Niño",
};

function formatCheckin(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GuestsOverview() {
  const [travelers, setTravelers] = useState<TravelerOverviewItem[]>([]);
  const [search, setSearch] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (query = search, code = bookingCode) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("q", query.trim());
      }
      if (code.trim()) {
        params.set("bookingCode", code.trim());
      }

      const response = await adminFetch(`/api/admin/guests?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as {
        travelers?: TravelerOverviewItem[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Error al cargar huéspedes.");
      }

      setTravelers(payload.travelers ?? []);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar.");
      setTravelers([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, bookingCode]);

  useEffect(() => {
    void load("", "");
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 coastal-shadow md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-on-surface-variant">Buscar</label>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre, documento o código de reserva"
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="w-full md:max-w-[200px]">
          <label className="mb-2 block text-sm font-medium text-on-surface-variant">Código reserva</label>
          <input
            type="text"
            value={bookingCode}
            onChange={(event) => setBookingCode(event.target.value.toUpperCase())}
            placeholder="HT-XXXX"
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm uppercase outline-none focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => void load(search, bookingCode)}
          className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Buscar
        </button>
      </div>

      {isLoading ? (
        <article className="rounded-[2rem] bg-white p-8 coastal-shadow">
          <p className="text-sm text-on-surface-variant">Cargando listado de huéspedes...</p>
        </article>
      ) : (
        <div className="overflow-hidden rounded-[2rem] bg-white coastal-shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low text-on-surface-variant">
                  <th className="px-4 py-3 font-semibold">Huésped</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Identificación</th>
                  <th className="px-4 py-3 font-semibold">Reserva</th>
                  <th className="px-4 py-3 font-semibold">Tour</th>
                  <th className="px-4 py-3 font-semibold">Pasadía</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {travelers.map((traveler, index) => (
                  <tr
                    key={`${traveler.bookingId}-${traveler.travelerRole}-${traveler.fullName}-${index}`}
                    className="border-b border-outline-variant/10 last:border-0"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-primary">{traveler.fullName}</p>
                      {traveler.travelerRole === "titular" && traveler.customerCity ? (
                        <p className="text-xs text-on-surface-variant">{traveler.customerCity}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          traveler.travelerRole === "titular"
                            ? "bg-primary text-white"
                            : traveler.travelerRole === "nino"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-blue-100 text-primary"
                        }`}
                      >
                        {roleLabels[traveler.travelerRole]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {traveler.idTypeName || traveler.idNumber ? (
                        <>
                          {traveler.idTypeName ? (
                            <p className="text-xs text-on-surface-variant">{traveler.idTypeName}</p>
                          ) : null}
                          <p>{traveler.idNumber ?? "—"}</p>
                        </>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs font-semibold text-primary">{traveler.bookingCode}</p>
                      {traveler.bookingSource === "website" ? (
                        <p className="text-xs text-on-surface-variant">Web</p>
                      ) : null}
                      {traveler.travelerRole === "titular" && traveler.customerPhone ? (
                        <p className="text-xs text-on-surface-variant">{traveler.customerPhone}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">{traveler.tourName}</td>
                    <td className="px-4 py-4">{formatCheckin(traveler.checkinAt)}</td>
                    <td className="px-4 py-4">
                      <BookingStatusBadge status={traveler.approvalStatus as ApprovalStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/reservas/${traveler.bookingId}/datos`}
                        className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary"
                      >
                        Ver / editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!travelers.length ? (
            <p className="p-8 text-center text-on-surface-variant">
              No hay huéspedes que coincidan con la búsqueda.
            </p>
          ) : (
            <p className="border-t border-outline-variant/10 px-6 py-3 text-xs text-on-surface-variant">
              {travelers.length} registro{travelers.length === 1 ? "" : "s"} (titulares y acompañantes)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
