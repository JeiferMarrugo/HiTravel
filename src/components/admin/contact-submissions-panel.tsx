"use client";

import { adminFetch } from "@/lib/admin/admin-fetch";
import { useCallback, useEffect, useState } from "react";
import { notify } from "@/lib/toast";

type ContactSubmissionItem = {
  id: string;
  fullName: string;
  email: string;
  phoneE164: string;
  message: string;
  clientWhatsAppSent: boolean;
  adminWhatsAppSent: boolean;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function whatsAppLink(phoneE164: string, message: string) {
  const text = encodeURIComponent(`Hola, te escribimos de HI TRAVEL respecto a tu mensaje: «${message.slice(0, 120)}»`);
  return `https://wa.me/${phoneE164.replace(/\D/g, "")}?text=${text}`;
}

export function ContactSubmissionsPanel() {
  const [submissions, setSubmissions] = useState<ContactSubmissionItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (query = search) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("q", query.trim());
      }

      const response = await adminFetch(`/api/admin/contact-submissions?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        submissions?: ContactSubmissionItem[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Error al cargar contactos.");
      }

      setSubmissions(payload.submissions ?? []);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar.");
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load("");
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-4 coastal-shadow sm:flex-row sm:items-end sm:p-6">
        <div className="min-w-0 flex-1">
          <label className="mb-2 block text-sm font-medium text-on-surface-variant">Buscar</label>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre, correo, teléfono o texto del mensaje"
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => void load(search)}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
        >
          Buscar
        </button>
      </div>

      <div className="rounded-[2rem] bg-white coastal-shadow overflow-hidden">
        <div className="border-b border-outline-variant/15 px-4 py-4 sm:px-6">
          <p className="text-sm text-on-surface-variant">
            {isLoading ? "Cargando..." : `${submissions.length} solicitud(es) de contacto`}
          </p>
        </div>

        {isLoading ? (
          <p className="px-6 py-10 text-sm text-on-surface-variant">Cargando contactos...</p>
        ) : submissions.length === 0 ? (
          <p className="px-6 py-10 text-sm text-on-surface-variant">
            Aún no hay mensajes del formulario de contacto.
          </p>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {submissions.map((item) => (
              <article key={item.id} className="space-y-4 px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-primary">{item.fullName}</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">{formatDate(item.createdAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <a href={`mailto:${item.email}`} className="font-medium text-primary hover:underline">
                        {item.email}
                      </a>
                      <a
                        href={whatsAppLink(item.phoneE164, item.message)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-green-700 hover:underline"
                      >
                        +{item.phoneE164}
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.clientWhatsAppSent ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"
                      }`}
                    >
                      {item.clientWhatsAppSent ? "WhatsApp cliente ✓" : "WhatsApp cliente pendiente"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.adminWhatsAppSent ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"
                      }`}
                    >
                      {item.adminWhatsAppSent ? "Aviso equipo ✓" : "Aviso equipo pendiente"}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Mensaje</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-on-surface">{item.message}</p>
                </div>
                <a
                  href={whatsAppLink(item.phoneE164, item.message)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  Responder por WhatsApp
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
