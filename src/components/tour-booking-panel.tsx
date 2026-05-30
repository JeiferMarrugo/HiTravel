"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatMoneyDisplay } from "@/lib/catalog/money";
import { BookingTopReviews } from "@/components/tour-reviews-section";
import type { PublicTourReview } from "@/lib/catalog/tour-reviews";
import { convertForDisplay, type DisplayCurrency } from "@/lib/pricing/display-currency";

type TourBookingPanelProps = {
  slug: string;
  priceFromCents: number;
  storedCurrency: string;
  displayCurrency: DisplayCurrency;
  usdCopRate: number;
  contactHref: string;
  topReviews?: PublicTourReview[];
  reviewRating?: number;
  reviewCount?: number;
};

type QuoteResponse = {
  adultUnitCents: number;
  childUnitCents: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  promotionBadge: string | null;
  lines: Array<{
    promotionName: string;
    description: string;
    discountCents: number;
  }>;
  error?: string;
};

function formatDisplayAmount(
  amountMinor: number,
  storedCurrency: string,
  displayCurrency: DisplayCurrency,
  usdCopRate: number,
): string {
  const converted = convertForDisplay(amountMinor, storedCurrency, displayCurrency, usdCopRate);
  return formatMoneyDisplay(converted.amountMinor, converted.currency);
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  if (rating <= 0 && reviews <= 0) {
    return null;
  }

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const extraFull = rating - fullStars >= 0.75 ? 1 : 0;
  const stars = Array.from({ length: 5 }, (_, index) => {
    if (index < fullStars + extraFull) {
      return "star";
    }
    if (index === fullStars + extraFull && hasHalf) {
      return "star_half";
    }
    return "star";
  });

  return (
    <div className="flex items-center text-secondary">
      {stars.map((icon, index) => (
        <span key={index} className="material-symbols-outlined">
          {icon}
        </span>
      ))}
      <span className="ml-2 text-sm font-semibold text-on-surface-variant">
        {rating.toFixed(1)} ({reviews} reseñas)
      </span>
    </div>
  );
}

export function TourDetailRating({ rating, reviews }: { rating: number; reviews: number }) {
  if (rating <= 0 && reviews <= 0) {
    return null;
  }
  return <StarRating rating={rating} reviews={reviews} />;
}

export function TourBookingPanel({
  slug,
  priceFromCents,
  storedCurrency,
  displayCurrency,
  usdCopRate,
  contactHref,
  topReviews = [],
  reviewRating = 0,
  reviewCount = 0,
}: TourBookingPanelProps) {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [checkinAt, setCheckinAt] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const priceFromLabel = useMemo(
    () => formatDisplayAmount(priceFromCents, storedCurrency, displayCurrency, usdCopRate),
    [priceFromCents, storedCurrency, displayCurrency, usdCopRate],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadQuote() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/public/tour-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            adults,
            children,
            checkinAt: checkinAt || undefined,
          }),
        });
        const payload = (await response.json()) as QuoteResponse;
        if (!response.ok) {
          throw new Error(payload.error ?? "Error al calcular.");
        }
        if (!cancelled) {
          setQuote(payload);
        }
      } catch {
        if (!cancelled) {
          setQuote(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [slug, adults, children, checkinAt]);

  const fmt = (amountMinor: number, currency = quote?.currency ?? storedCurrency) =>
    formatDisplayAmount(amountMinor, currency, displayCurrency, usdCopRate);

  const adultLine =
    quote && adults > 0
      ? `${fmt(quote.adultUnitCents)} x ${adults} adulto${adults > 1 ? "s" : ""}`
      : null;
  const childLine =
    quote && children > 0
      ? `${fmt(quote.childUnitCents)} x ${children} niño${children > 1 ? "s" : ""}`
      : null;

  const reserveUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("adultos", String(adults));
    params.set("ninos", String(children));
    if (checkinAt) {
      params.set("fecha", checkinAt);
    }
    return `/reservar/${slug}?${params.toString()}`;
  }, [slug, adults, children, checkinAt]);

  return (
    <div className="sticky top-28 rounded-3xl border border-outline-variant/30 bg-white p-8 coastal-shadow">
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-on-surface-variant">Precio desde</p>
          <h2 className="text-[36px] font-extrabold leading-[44px] text-primary">
            {priceFromLabel}
            <span className="text-base font-normal text-on-surface-variant">/persona</span>
          </h2>
        </div>
        {quote?.promotionBadge ? (
          <div className="mb-2 shrink-0 rounded-lg bg-secondary-container px-3 py-1 text-sm font-bold text-on-secondary-container">
            {quote.promotionBadge}
          </div>
        ) : null}
      </div>

      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-primary">Fecha de viaje</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              calendar_month
            </span>
            <input
              type="date"
              value={checkinAt}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setCheckinAt(event.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-3 pl-12 pr-4 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">Adultos (12+)</label>
            <select
              value={adults}
              onChange={(event) => setAdults(Number(event.target.value))}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
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
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none"
            >
              {Array.from({ length: 6 }, (_, index) => index).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3 border-t border-outline-variant/20 pt-4">
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">Calculando precio…</p>
          ) : quote ? (
            <>
              {adultLine ? (
                <div className="flex justify-between text-sm">
                  <span>{adultLine}</span>
                  <span>{fmt(quote.adultUnitCents * adults)}</span>
                </div>
              ) : null}
              {childLine ? (
                <div className="flex justify-between text-sm">
                  <span>{childLine}</span>
                  <span>{fmt(quote.childUnitCents * children)}</span>
                </div>
              ) : null}
              {quote.discountCents > 0 ? (
                <>
                  {quote.lines.map((line) => (
                    <div
                      key={`${line.promotionName}-${line.description}`}
                      className="flex justify-between text-sm text-on-tertiary-container"
                    >
                      <span>
                        {line.promotionName}
                        {line.description ? ` (${line.description})` : ""}
                      </span>
                      <span>-{fmt(line.discountCents)}</span>
                    </div>
                  ))}
                </>
              ) : null}
              <div className="flex justify-between pt-2 text-[22px] font-semibold text-primary">
                <span>Precio total</span>
                <span>{fmt(quote.totalCents)}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-on-surface-variant">No se pudo calcular el precio.</p>
          )}
        </div>

        <Link
          href={reserveUrl}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-4 text-[22px] font-semibold text-on-secondary-container transition-all hover:shadow-lg"
        >
          <span className="material-symbols-outlined">bolt</span>
          Reservar ahora
        </Link>
        <p className="text-center text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-base">verified_user</span> Reserva segura. Sin cargos
          ocultos.
        </p>
      </form>

      <BookingTopReviews
        reviews={topReviews}
        averageRating={reviewRating}
        reviewCount={reviewCount}
      />

      <div className="mt-8 flex items-center gap-4 rounded-2xl bg-surface-container-low p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="material-symbols-outlined text-primary">chat</span>
        </div>
        <div>
          <p className="text-sm font-bold text-primary">¿Necesitas un plan personalizado?</p>
          <a href={contentContactHref(contactHref)} className="text-sm text-on-surface-variant">
            Habla con un asesor de viajes
          </a>
        </div>
      </div>
    </div>
  );
}

function contentContactHref(contactHref: string) {
  if (contactHref.startsWith("http") || contactHref.startsWith("tel:") || contactHref.startsWith("mailto:")) {
    return contactHref;
  }
  return contactHref;
}
