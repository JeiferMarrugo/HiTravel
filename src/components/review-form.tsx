"use client";

import Link from "next/link";
import { useState } from "react";
import { notify } from "@/lib/toast";

type ReviewFormProps = {
  token: string;
  customerName: string;
  tourName: string;
  bookingCode: string;
  tourSlug: string | null;
  alreadyReviewed: boolean;
  expired: boolean;
};

export function ReviewForm({
  token,
  customerName,
  tourName,
  bookingCode,
  tourSlug,
  alreadyReviewed,
  expired,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyReviewed);

  const firstName = customerName.trim().split(/\s+/)[0] || "Viajero";
  const displayRating = hoverRating || rating;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (rating < 1) {
      notify.error("Selecciona cuántas estrellas merece tu experiencia.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/public/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, rating, comment }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Error al enviar.");
      }
      setSubmitted(true);
      notify.success("¡Gracias por tu reseña!");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al enviar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (expired && !submitted) {
    return (
      <div className="rounded-3xl border border-outline-variant/20 bg-white p-10 text-center coastal-shadow">
        <span className="material-symbols-outlined mb-4 text-5xl text-on-surface-variant">schedule</span>
        <h2 className="text-2xl font-bold text-primary">Enlace expirado</h2>
        <p className="mt-3 text-on-surface-variant">
          Este enlace de reseña ya no está disponible. Escríbenos por WhatsApp si quieres compartir tu experiencia.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-secondary-container/40 bg-gradient-to-br from-secondary-container/30 to-white p-10 text-center coastal-shadow">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container">
          <span className="material-symbols-outlined text-4xl text-on-secondary-container">favorite</span>
        </div>
        <h2 className="text-3xl font-extrabold text-primary">¡Gracias, {firstName}!</h2>
        <p className="mt-4 text-lg text-on-surface-variant">
          Tu opinión sobre <strong>{tourName}</strong> ya forma parte de HI TRAVEL. Reserva{" "}
          <span className="font-mono text-primary">{bookingCode}</span>.
        </p>
        {tourSlug ? (
          <Link
            href={`/tours/${tourSlug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white"
          >
            Ver la experiencia
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="overflow-hidden rounded-3xl border border-outline-variant/20 bg-white coastal-shadow"
    >
      <div className="bg-gradient-to-br from-primary via-primary to-tertiary-container px-8 py-10 text-on-primary md:px-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary-container/90">
          Tu experiencia cuenta
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
          Hola, {firstName}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-on-primary/90">
          Cuéntanos cómo fue <strong className="text-secondary-container">{tourName}</strong>
        </p>
        <p className="mt-2 text-sm text-on-primary/70">
          Reserva <span className="font-mono">{bookingCode}</span>
        </p>
      </div>

      <div className="space-y-8 p-8 md:p-12">
        <div className="text-center">
          <p className="mb-4 text-sm font-semibold text-on-surface-variant">¿Cómo calificarías el pasadía?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="rounded-full p-1 transition-transform hover:scale-110"
                aria-label={`${value} estrellas`}
              >
                <span
                  className={`material-symbols-outlined text-4xl md:text-5xl ${
                    value <= displayRating ? "text-secondary" : "text-outline-variant/50"
                  }`}
                >
                  {value <= displayRating ? "star" : "star"}
                </span>
              </button>
            ))}
          </div>
          {rating > 0 ? (
            <p className="mt-3 text-sm font-medium text-primary">
              {rating === 5
                ? "¡Excelente!"
                : rating >= 4
                  ? "Muy bueno"
                  : rating >= 3
                    ? "Bueno"
                    : rating >= 2
                      ? "Regular"
                      : "Necesitamos mejorar"}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-primary">Tu reseña</label>
          <textarea
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="¿Qué fue lo que más disfrutaste? ¿Recomendarías esta experiencia?"
            className="w-full resize-y rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-4 text-base outline-none focus:border-primary"
          />
          <p className="mt-2 text-xs text-on-surface-variant">Mínimo 10 caracteres. Solo tu primer nombre se mostrará en el sitio.</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary-container py-4 text-lg font-semibold text-on-secondary-container transition-all hover:shadow-lg disabled:opacity-60"
        >
          <span className="material-symbols-outlined">send</span>
          {isSubmitting ? "Enviando..." : "Publicar mi reseña"}
        </button>
      </div>
    </form>
  );
}
