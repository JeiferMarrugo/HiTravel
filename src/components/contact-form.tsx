"use client";

import { useState } from "react";
import { notify } from "@/lib/toast";

const initialFormData = {
  email: "",
  message: "",
  name: "",
  phone: "",
};

export function ContactForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/whatsapp/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "No fue posible enviar tu mensaje.");
      }

      notify.success(payload.message ?? "Mensaje enviado correctamente.");
      setFormData(initialFormData);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible enviar tu mensaje.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="block text-sm font-semibold text-on-surface-variant">
            Nombre completo
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            placeholder="Juan Pérez"
            className="w-full rounded-lg border border-outline-variant/30 bg-surface-container p-3 outline-none transition-all focus:border-on-tertiary-container focus:ring-2 focus:ring-on-tertiary-container"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-email" className="block text-sm font-semibold text-on-surface-variant">
            Correo electrónico
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={formData.email}
            onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
            placeholder="juan@correo.com"
            className="w-full rounded-lg border border-outline-variant/30 bg-surface-container p-3 outline-none transition-all focus:border-on-tertiary-container focus:ring-2 focus:ring-on-tertiary-container"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-phone" className="block text-sm font-semibold text-on-surface-variant">
          Número de teléfono
        </label>
        <input
          id="contact-phone"
          type="tel"
          required
          value={formData.phone}
          onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
          placeholder="+57 300 123 4567"
          className="w-full rounded-lg border border-outline-variant/30 bg-surface-container p-3 outline-none transition-all focus:border-on-tertiary-container focus:ring-2 focus:ring-on-tertiary-container"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="block text-sm font-semibold text-on-surface-variant">
          Mensaje
        </label>
        <textarea
          id="contact-message"
          rows={5}
          required
          value={formData.message}
          onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
          placeholder="Cuéntanos sobre el viaje que quieres vivir..."
          className="w-full rounded-lg border border-outline-variant/30 bg-surface-container p-3 outline-none transition-all focus:border-on-tertiary-container focus:ring-2 focus:ring-on-tertiary-container"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-secondary-container px-10 py-4 text-[22px] font-semibold text-on-secondary-container transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
      >
        {isSubmitting ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}
