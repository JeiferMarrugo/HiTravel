"use client";

import { useMemo, useState } from "react";
import type { OpenWaContact } from "@/lib/admin/types";
import { notify } from "@/lib/toast";

type ContactsPanelProps = {
  contacts: OpenWaContact[];
  isLoading: boolean;
  onCheckNumber: (number: string) => Promise<{ exists: boolean; whatsappId: string | null }>;
  onLoadProfilePicture: (contactId: string) => Promise<string | null | undefined>;
  onToggleBlock: (contactId: string, action: "block" | "unblock") => Promise<void>;
  selectedSessionId?: string | null;
};

export function ContactsPanel({
  contacts,
  isLoading,
  onCheckNumber,
  onLoadProfilePicture,
  onToggleBlock,
  selectedSessionId,
}: ContactsPanelProps) {
  const [numberToCheck, setNumberToCheck] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  );

  async function handleCheckNumber(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!numberToCheck.trim() || !selectedSessionId) {
      return;
    }

    try {
      const result = await onCheckNumber(numberToCheck.trim());
      notify.info(result.exists ? `El número sí existe en WhatsApp: ${result.whatsappId}` : "Ese número no aparece en WhatsApp.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible validar el número.");
    }
  }

  async function handleProfilePicture(contactId: string) {
    try {
      const url = await onLoadProfilePicture(contactId);
      setProfilePictureUrl(url ?? null);
      notify.success("Foto de perfil cargada.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible consultar la foto.");
    }
  }

  async function handleToggleBlock(contactId: string, action: "block" | "unblock") {
    try {
      await onToggleBlock(contactId, action);
      notify.success(action === "block" ? "Contacto bloqueado." : "Contacto desbloqueado.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible ejecutar la acción.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-primary">Contactos</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Explora contactos de la sesión activa y valida números antes de iniciar una conversación.</p>
        </div>

        <form className="mb-6 flex flex-col gap-3 md:flex-row" onSubmit={handleCheckNumber}>
          <input
            type="text"
            value={numberToCheck}
            onChange={(event) => setNumberToCheck(event.target.value)}
            placeholder="Ej. 573001234567"
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <button type="submit" disabled={!selectedSessionId} className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            Validar
          </button>
        </form>

        <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
          {contacts.length ? (
            contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => {
                  setSelectedContactId(contact.id);
                  setProfilePictureUrl(null);
                }}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                  selectedContactId === contact.id
                    ? "border-primary bg-blue-50"
                    : "border-outline-variant/15 bg-surface-container-lowest hover:bg-surface-container-low"
                }`}
              >
                <p className="font-semibold text-primary">{contact.pushname || contact.name || contact.number || contact.id}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{contact.id}</p>
              </button>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-on-surface-variant">
              {isLoading ? "Cargando contactos..." : "No se encontraron contactos en esta sesión."}
            </div>
          )}
        </div>
      </article>

      <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-primary">Detalle del contacto</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Consulta foto de perfil y ejecuta acciones rápidas de moderación.</p>
        </div>

        {selectedContact ? (
          <div className="space-y-5">
            <div className="rounded-[1.5rem] bg-surface-container-low p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {(selectedContact.pushname || selectedContact.name || selectedContact.number || "WA").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">{selectedContact.pushname || selectedContact.name || "Sin nombre visible"}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{selectedContact.id}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleProfilePicture(selectedContact.id)}
                className="rounded-2xl bg-secondary-container px-4 py-3 text-sm font-semibold text-primary"
              >
                Ver foto
              </button>
              <button
                type="button"
                onClick={() => handleToggleBlock(selectedContact.id, "block")}
                className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                Bloquear
              </button>
              <button
                type="button"
                onClick={() => handleToggleBlock(selectedContact.id, "unblock")}
                className="rounded-2xl bg-surface-container-high px-4 py-3 text-sm font-semibold text-primary"
              >
                Desbloquear
              </button>
            </div>

            <div className="rounded-[1.5rem] bg-surface-container-low p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">Foto de perfil</p>
              <div className="mt-4 flex h-56 items-center justify-center rounded-[1.5rem] bg-white">
                {profilePictureUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profilePictureUrl} alt="Foto del contacto" className="h-full w-full rounded-[1.5rem] object-cover" />
                ) : (
                  <span className="text-sm text-on-surface-variant">Aún no se ha cargado la foto.</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-on-surface-variant">
            Selecciona un contacto para ver sus detalles.
          </div>
        )}
      </article>
    </div>
  );
}
