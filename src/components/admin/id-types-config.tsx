"use client";

import { useCallback, useEffect, useState } from "react";
import type { CatalogIdType } from "@/lib/catalog/id-types";
import { notify } from "@/lib/toast";

export function IdTypesConfig() {
  const [idTypes, setIdTypes] = useState<CatalogIdType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/id-types");
      const payload = (await response.json()) as { idTypes?: CatalogIdType[]; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Error al cargar.");
      }
      setIdTypes(payload.idTypes ?? []);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar tipos de ID.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>) {
    const response = await fetch("/api/admin/id-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { idTypes?: CatalogIdType[]; error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? "Error al guardar.");
    }
    setIdTypes(payload.idTypes ?? []);
  }

  return (
    <article className="rounded-[2rem] bg-white p-8 coastal-shadow">
      <h2 className="text-[22px] font-semibold text-primary">Tipos de identificación</h2>
      <p className="mt-2 text-sm text-on-surface-variant">
        Se usan en el formulario público de reserva y al registrar viajeros en el admin.
      </p>

      <form
        className="mt-6 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void post({ kind: "create", code: newCode, name: newName })
            .then(() => {
              setNewCode("");
              setNewName("");
              notify.success("Tipo agregado.");
            })
            .catch((error) => notify.error(error instanceof Error ? error.message : "Error."));
        }}
      >
        <input
          value={newCode}
          onChange={(event) => setNewCode(event.target.value)}
          placeholder="Código (ej. CC)"
          className="w-28 rounded-xl border px-3 py-2 text-sm"
        />
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nombre (ej. Cédula de ciudadanía)"
          className="min-w-[220px] flex-1 rounded-xl border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
          Agregar
        </button>
      </form>

      {isLoading ? (
        <p className="mt-4 text-sm text-on-surface-variant">Cargando...</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {idTypes.map((type) => (
            <li
              key={type.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/15 px-4 py-3"
            >
              <span className="text-sm">
                <span className="font-mono font-semibold text-primary">{type.code}</span> — {type.name}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void post({ kind: "toggle", id: type.id, isActive: !type.isActive })
                      .then(() => notify.success("Actualizado."))
                      .catch((error) => notify.error(error instanceof Error ? error.message : "Error."))
                  }
                  className="rounded-lg bg-surface-container-low px-3 py-1 text-xs font-semibold text-primary"
                >
                  {type.isActive ? "Activo" : "Inactivo"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void post({ kind: "delete", id: type.id })
                      .then(() => notify.success("Eliminado."))
                      .catch((error) => notify.error(error instanceof Error ? error.message : "Error."))
                  }
                  className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
