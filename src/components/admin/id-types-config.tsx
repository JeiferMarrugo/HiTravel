"use client";



import { adminFetch } from "@/lib/admin/admin-fetch";

import { submitAdminJsonForm } from "@/lib/admin/submit-admin-json-form";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { CatalogIdType } from "@/lib/catalog/id-types";

import { notify } from "@/lib/toast";



type IdTypesResponse = { idTypes?: CatalogIdType[]; error?: string };



export function IdTypesConfig({ initialIdTypes }: { initialIdTypes?: CatalogIdType[] }) {

  const [idTypes, setIdTypes] = useState<CatalogIdType[]>(initialIdTypes ?? []);

  const [isLoading, setIsLoading] = useState(initialIdTypes === undefined);

  const [isSaving, setIsSaving] = useState(false);

  const [newCode, setNewCode] = useState("");

  const [newName, setNewName] = useState("");



  const load = useCallback(async () => {

    setIsLoading(true);

    try {

      const response = await adminFetch("/api/admin/id-types");

      const payload = (await response.json()) as IdTypesResponse;

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

    if (initialIdTypes !== undefined) {

      return;

    }

    void load();

  }, [initialIdTypes, load]);



  const createPayload = useMemo(

    () => JSON.stringify({ kind: "create", code: newCode, name: newName }),

    [newCode, newName],

  );



  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {

    await submitAdminJsonForm<IdTypesResponse>(event, {

      url: "/api/admin/id-types",

      method: "POST",

      payload: createPayload,

      setSaving: setIsSaving,

      onSuccess: (payload) => {

        setIdTypes(payload.idTypes ?? []);

        setNewCode("");

        setNewName("");

        notify.success("Tipo agregado.");

      },

    });

  }



  async function post(body: Record<string, unknown>) {

    const response = await adminFetch("/api/admin/id-types", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(body),

    });

    const payload = (await response.json()) as IdTypesResponse;

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

        method="POST"

        action="/api/admin/id-types"

        className="mt-6 flex flex-wrap gap-2"

        onSubmit={(event) => void handleCreate(event)}

      >

        <input type="hidden" name="payload" value={createPayload} readOnly />

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

        <button

          type="submit"

          disabled={isSaving}

          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"

        >

          {isSaving ? "Guardando..." : "Agregar"}

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


