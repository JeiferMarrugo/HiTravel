"use client";

import { useMemo, useState } from "react";
import type { OpenWaGroup } from "@/lib/admin/types";
import { notify } from "@/lib/toast";

type GroupsPanelProps = {
  groups: OpenWaGroup[];
  isLoading: boolean;
  onCreateGroup: (name: string, participants: string[]) => Promise<void>;
  onGetInviteCode: (groupId: string) => Promise<{ inviteCode: string; inviteLink: string }>;
  onRunAction: (
    groupId: string,
    action: "addParticipants" | "removeParticipants" | "promoteParticipants" | "demoteParticipants" | "leave" | "revokeInviteCode",
    participants?: string[],
  ) => Promise<void>;
  onSelectGroup: (groupId: string) => Promise<void>;
  onUpdateField: (groupId: string, action: "subject" | "description", value: string) => Promise<void>;
};

function parseParticipants(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function GroupsPanel({
  groups,
  isLoading,
  onCreateGroup,
  onGetInviteCode,
  onRunAction,
  onSelectGroup,
  onUpdateField,
}: GroupsPanelProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [participants, setParticipants] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  async function handleCreateGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!groupName.trim()) {
      return;
    }

    try {
      await onCreateGroup(groupName.trim(), parseParticipants(participants));
      setGroupName("");
      setParticipants("");
      notify.success("Grupo creado correctamente.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible crear el grupo.");
    }
  }

  async function handleSelectGroup(groupId: string) {
    setSelectedGroupId(groupId);
    setInviteLink(null);

    try {
      await onSelectGroup(groupId);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible cargar el grupo.");
    }
  }

  async function handleUpdateField(action: "subject" | "description", value: string) {
    if (!selectedGroupId || !value.trim()) {
      return;
    }

    try {
      await onUpdateField(selectedGroupId, action, value.trim());
      notify.success(action === "subject" ? "Nombre del grupo actualizado." : "Descripción actualizada.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible guardar el cambio.");
    }
  }

  async function handleGroupAction(
    action: "addParticipants" | "removeParticipants" | "promoteParticipants" | "demoteParticipants" | "leave" | "revokeInviteCode",
  ) {
    if (!selectedGroupId) {
      return;
    }

    try {
      await onRunAction(selectedGroupId, action, parseParticipants(participants));
      notify.success("Acción ejecutada correctamente.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible ejecutar la acción.");
    }
  }

  async function handleInviteCode() {
    if (!selectedGroupId) {
      return;
    }

    try {
      const result = await onGetInviteCode(selectedGroupId);
      setInviteLink(result.inviteLink);
      notify.success("Enlace de invitación obtenido.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible obtener el enlace.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-primary">Grupos</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Crea grupos, administra participantes y obtén enlaces de invitación.</p>
        </div>

        <form className="space-y-3" onSubmit={handleCreateGroup}>
          <input
            type="text"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Nombre del grupo"
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <textarea
            value={participants}
            onChange={(event) => setParticipants(event.target.value)}
            rows={3}
            placeholder="Participantes separados por coma: 573001111111,573002222222"
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">
            Crear grupo
          </button>
        </form>

        <div className="mt-6 max-h-[500px] space-y-3 overflow-y-auto pr-1">
          {groups.length ? (
            groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => void handleSelectGroup(group.id)}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                  selectedGroupId === group.id
                    ? "border-primary bg-blue-50"
                    : "border-outline-variant/15 bg-surface-container-lowest hover:bg-surface-container-low"
                }`}
              >
                <p className="font-semibold text-primary">{group.name || group.subject || group.id}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{group.id}</p>
              </button>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-on-surface-variant">
              {isLoading ? "Cargando grupos..." : "No hay grupos disponibles para esta sesión."}
            </div>
          )}
        </div>
      </article>

      <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-primary">Detalle del grupo</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Actualiza nombre, descripción, participantes e invitación.</p>
        </div>

        {selectedGroup ? (
          <div className="space-y-5">
            <div className="rounded-[1.5rem] bg-surface-container-low p-5">
              <p className="text-lg font-semibold text-primary">{selectedGroup.name || selectedGroup.subject || selectedGroup.id}</p>
              <p className="mt-1 text-sm text-on-surface-variant">{selectedGroup.id}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder={selectedGroup.subject || "Nuevo nombre del grupo"}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => void handleUpdateField("subject", subject)}
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  Guardar nombre
                </button>
              </div>
              <div className="space-y-3">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder={selectedGroup.description || "Nueva descripción del grupo"}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => void handleUpdateField("description", description)}
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  Guardar descripción
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-surface-container-low p-5">
              <textarea
                value={participants}
                onChange={(event) => setParticipants(event.target.value)}
                rows={3}
                placeholder="Números o IDs separados por coma"
                className="w-full rounded-2xl border border-outline-variant/20 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => void handleGroupAction("addParticipants")} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">
                  Agregar
                </button>
                <button type="button" onClick={() => void handleGroupAction("removeParticipants")} className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">
                  Quitar
                </button>
                <button type="button" onClick={() => void handleGroupAction("promoteParticipants")} className="rounded-full bg-secondary-container px-4 py-2 text-xs font-semibold text-primary">
                  Promover
                </button>
                <button type="button" onClick={() => void handleGroupAction("demoteParticipants")} className="rounded-full bg-surface-container-high px-4 py-2 text-xs font-semibold text-primary">
                  Degradar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => void handleInviteCode()} className="rounded-2xl bg-secondary-container px-4 py-3 text-sm font-semibold text-primary">
                Obtener enlace
              </button>
              <button type="button" onClick={() => void handleGroupAction("revokeInviteCode")} className="rounded-2xl bg-surface-container-high px-4 py-3 text-sm font-semibold text-primary">
                Revocar enlace
              </button>
              <button type="button" onClick={() => void handleGroupAction("leave")} className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                Salir del grupo
              </button>
            </div>

            {inviteLink ? (
              <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm">
                <p className="font-semibold text-primary">Enlace actual</p>
                <p className="mt-2 break-all text-on-surface-variant">{inviteLink}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-on-surface-variant">
            Selecciona un grupo para ver su detalle y ejecutar acciones.
          </div>
        )}
      </article>
    </div>
  );
}
