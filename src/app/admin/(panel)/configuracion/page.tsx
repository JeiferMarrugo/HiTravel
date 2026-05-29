"use client";

import { useMemo, useState } from "react";
import { normalizeCountryName, readStoredCountries, writeStoredCountries } from "@/lib/countries";
import { settingsSections } from "@/lib/admin/settings-data";

export default function AdminSettingsPage() {
  const [countries, setCountries] = useState<string[]>(() => readStoredCountries());
  const [newCountry, setNewCountry] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const hasCountries = useMemo(() => countries.length > 0, [countries]);

  function saveCountries(nextCountries: string[]) {
    setCountries(nextCountries);
    writeStoredCountries(nextCountries);
    window.dispatchEvent(new Event("countries-updated"));
  }

  function handleAddCountry() {
    const normalized = normalizeCountryName(newCountry);

    if (!normalized) {
      return;
    }

    if (countries.some((country) => country.toLowerCase() === normalized.toLowerCase())) {
      setNewCountry("");
      return;
    }

    saveCountries([...countries, normalized]);
    setNewCountry("");
  }

  function handleDeleteCountry(index: number) {
    saveCountries(countries.filter((_, currentIndex) => currentIndex !== index));
  }

  function handleEditCountry(index: number) {
    setEditingIndex(index);
    setEditingValue(countries[index]);
  }

  function handleSaveEdit() {
    if (editingIndex === null) {
      return;
    }

    const normalized = normalizeCountryName(editingValue);

    if (!normalized) {
      return;
    }

    const nextCountries = [...countries];
    nextCountries[editingIndex] = normalized;
    saveCountries(nextCountries);
    setEditingIndex(null);
    setEditingValue("");
  }

  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Configuración</h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Administra la información general, reglas de notificación y parámetros operativos del panel.
        </p>
      </section>

      <section className="space-y-6">
        {settingsSections.map((section) => (
          <article key={section.id} className="rounded-[2rem] bg-white p-8 coastal-shadow">
            <div className="mb-6">
              <h2 className="text-[22px] font-semibold text-primary">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">{section.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {section.fields.map((field) => (
                <div key={field.label}>
                  <label className="mb-2 block text-sm font-medium text-on-surface-variant">{field.label}</label>
                  <input
                    type={field.type ?? "text"}
                    defaultValue={field.value}
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
                  />
                </div>
              ))}
            </div>
          </article>
        ))}

        <article className="rounded-[2rem] bg-white p-8 coastal-shadow">
          <div className="mb-6">
            <h2 className="text-[22px] font-semibold text-primary">Países y destinos del buscador</h2>
            <p className="mt-2 text-sm leading-7 text-on-surface-variant">
              Esta lista alimenta el campo `¿A dónde quieres ir?` en la página pública. Se guarda localmente en este
              navegador como demo administrativa.
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={newCountry}
              onChange={(event) => setNewCountry(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddCountry();
                }
              }}
              placeholder="Agregar país"
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
            />
            <button
              type="button"
              onClick={handleAddCountry}
              className="rounded-xl bg-secondary-container px-5 py-3 text-sm font-semibold text-primary"
            >
              Agregar país
            </button>
          </div>

          {hasCountries ? (
            <div className="space-y-3">
              {countries.map((country, index) => (
                <div
                  key={`${country}-${index}`}
                  className="flex flex-col gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 md:flex-row md:items-center md:justify-between"
                >
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(event) => setEditingValue(event.target.value)}
                      className="w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 outline-none"
                    />
                  ) : (
                    <span className="font-medium text-primary">{country}</span>
                  )}

                  <div className="flex gap-2">
                    {editingIndex === index ? (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIndex(null);
                            setEditingValue("");
                          }}
                          className="rounded-xl bg-surface-container-high px-4 py-2 text-sm font-medium text-primary"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditCountry(index)}
                          className="rounded-xl bg-surface-container-high px-4 py-2 text-sm font-medium text-primary"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCountry(index)}
                          className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-container-low p-6 text-sm text-on-surface-variant">
              Aún no has agregado países. Usa el campo superior para crear el primero.
            </div>
          )}
        </article>
      </section>

      <div className="mt-8 flex justify-end">
        <button className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white coastal-shadow">
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
