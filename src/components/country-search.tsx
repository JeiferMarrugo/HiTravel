"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultCountries } from "@/lib/countries";

const weekDays = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameCalendarDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

type CountrySearchProps = {
  countries: string[];
};

export function CountrySearch({ countries: initialCountries }: CountrySearchProps) {
  const router = useRouter();
  const datePickerRef = useRef<HTMLDivElement>(null);
  const passengerPickerRef = useRef<HTMLDivElement>(null);
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [countries, setCountries] = useState<string[]>(
    () => (initialCountries.length ? initialCountries : defaultCountries),
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengers, setShowPassengers] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = startOfDay(new Date());
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    setCountries(initialCountries.length ? initialCountries : defaultCountries);
  }, [initialCountries]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (datePickerRef.current && !datePickerRef.current.contains(target)) {
        setShowDatePicker(false);
      }

      if (passengerPickerRef.current && !passengerPickerRef.current.contains(target)) {
        setShowPassengers(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowDatePicker(false);
        setShowPassengers(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredCountries = useMemo(() => {
    const value = destination.trim().toLowerCase();

    if (!value) {
      return countries.slice(0, 5);
    }

    return countries.filter((country) => country.toLowerCase().includes(value)).slice(0, 5);
  }, [countries, destination]);

  const passengerSummary = useMemo(() => {
    const labels = [];

    if (adults > 0) {
      labels.push(`${adults} adulto${adults === 1 ? "" : "s"}`);
    }

    if (children > 0) {
      labels.push(`${children} niño${children === 1 ? "" : "s"}`);
    }

    return labels.join(", ");
  }, [adults, children]);

  const formattedTravelDate = useMemo(() => {
    if (!travelDate) {
      return "";
    }

    const selectedDate = parseDateValue(travelDate);

    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(selectedDate);
  }, [travelDate]);

  const visibleMonthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("es-CO", {
        month: "long",
        year: "numeric",
      }).format(visibleMonth),
    [visibleMonth],
  );

  const calendarDays = useMemo(() => {
    const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const monthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);

      return {
        date,
        isCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
        isSelected: travelDate ? isSameCalendarDay(date, parseDateValue(travelDate)) : false,
        isToday: isSameCalendarDay(date, startOfDay(new Date())),
        isDisabled: date < startOfDay(new Date()) && !isSameCalendarDay(date, startOfDay(new Date())),
        isMonthEnd: isSameCalendarDay(date, monthEnd),
      };
    });
  }, [travelDate, visibleMonth]);

  function submitSearch(selectedDestination?: string) {
    const value = (selectedDestination ?? destination).trim();

    const params = new URLSearchParams();

    if (value) {
      params.set("destino", value);
    }

    if (travelDate.trim()) {
      params.set("fecha", travelDate.trim());
    }

    params.set("adultos", String(adults));

    if (children > 0) {
      params.set("ninos", String(children));
    }

    const query = params.toString();
    router.push(query ? `/tours?${query}` : "/tours");
  }

  function updateAdults(nextValue: number) {
    setAdults(Math.max(1, nextValue));
  }

  function updateChildren(nextValue: number) {
    setChildren(Math.max(0, nextValue));
  }

  function openDatePicker() {
    setShowSuggestions(false);
    setShowPassengers(false);

    if (travelDate) {
      const selectedDate = parseDateValue(travelDate);
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }

    setShowDatePicker((current) => !current);
  }

  function selectDate(date: Date) {
    setTravelDate(formatDateValue(date));
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setShowDatePicker(false);
  }

  function goToMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function goToToday() {
    const today = startOfDay(new Date());
    selectDate(today);
  }

  return (
    <div className="glass-card mx-auto flex w-full max-w-5xl flex-col gap-2 rounded-[2rem] p-2 coastal-shadow md:flex-row md:items-center">
      <div className="relative flex flex-1 items-center gap-3 px-6">
        <span className="material-symbols-outlined text-primary">location_on</span>
        <input
          type="text"
          value={destination}
          placeholder="¿A dónde quieres ir?"
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            window.setTimeout(() => setShowSuggestions(false), 120);
          }}
          onChange={(event) => {
            setDestination(event.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitSearch();
            }
          }}
          className="w-full border-none bg-transparent text-on-surface outline-none placeholder:text-on-surface-variant/60"
        />

        {showSuggestions && filteredCountries.length > 0 ? (
          <div className="absolute left-4 right-4 top-full z-30 mt-3 rounded-2xl bg-white p-2 text-left coastal-shadow">
            {filteredCountries.map((country) => (
              <button
                key={country}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setDestination(country);
                  setShowSuggestions(false);
                  submitSearch(country);
                }}
                className="block w-full rounded-xl px-4 py-3 text-sm text-on-surface transition hover:bg-surface-container-low"
              >
                {country}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="hidden h-8 w-px self-center bg-outline-variant/30 md:block" />

      <div ref={datePickerRef} className="relative flex min-w-0 flex-1 items-center gap-3 px-6">
        <span className="material-symbols-outlined text-primary">calendar_today</span>
        <button type="button" onClick={openDatePicker} className="min-w-0 flex-1 text-left">
          <span className={`block truncate text-sm md:text-base ${formattedTravelDate ? "font-medium text-on-surface" : "text-on-surface-variant/60"}`}>
            {formattedTravelDate || "Selecciona tu fecha"}
          </span>
        </button>
        {travelDate ? (
          <button
            type="button"
            onClick={() => setTravelDate("")}
            className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-primary transition hover:bg-surface-container"
            aria-label="Limpiar fecha"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        ) : null}
        {showDatePicker ? (
          <div className="absolute bottom-[calc(100%-0.35rem)] left-0 z-30 w-[320px] max-w-[calc(100vw-2rem)] rounded-[1.75rem] bg-white p-5 text-left coastal-shadow">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-primary transition hover:bg-surface-container"
                aria-label="Mes anterior"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <p className="text-sm font-semibold capitalize tracking-[0.12em] text-primary">{visibleMonthLabel}</p>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-primary transition hover:bg-surface-container"
                aria-label="Mes siguiente"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2 text-center">
              {weekDays.map((day) => (
                <span key={day} className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant/60">
                  {day}
                </span>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-2">
              {calendarDays.map(({ date, isCurrentMonth, isDisabled, isSelected, isToday }, index) => (
                <button
                  key={`${date.toISOString()}-${index}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => selectDate(date)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                    isSelected
                      ? "bg-primary text-white shadow-lg"
                      : isToday
                        ? "border border-primary/20 bg-blue-50 text-primary"
                        : isCurrentMonth
                          ? "text-on-surface hover:bg-surface-container-low"
                          : "text-on-surface-variant/45 hover:bg-surface-container-low"
                  } ${isDisabled ? "cursor-not-allowed opacity-35" : ""}`}
                >
                  {date.getDate()}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setTravelDate("");
                  setShowDatePicker(false);
                }}
                className="text-sm font-semibold text-on-surface-variant transition hover:text-primary"
              >
                Borrar
              </button>
              <button type="button" onClick={goToToday} className="text-sm font-semibold text-primary transition hover:opacity-80">
                Hoy
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="hidden h-8 w-px self-center bg-outline-variant/30 md:block" />

      <div ref={passengerPickerRef} className="relative flex min-w-0 flex-1 items-center gap-3 px-6">
        <span className="material-symbols-outlined text-primary">groups</span>
        <button
          type="button"
          onClick={() => {
            setShowSuggestions(false);
            setShowDatePicker(false);
            setShowPassengers((current) => !current);
          }}
          className="w-full min-w-0 text-left text-on-surface outline-none"
          aria-expanded={showPassengers}
          aria-haspopup="dialog"
        >
          <span className={`block truncate ${passengerSummary ? "" : "text-on-surface-variant/60"}`}>
            {passengerSummary || "Cantidad de personas"}
          </span>
        </button>

        {showPassengers ? (
          <div className="absolute right-0 top-full z-30 mt-3 w-[320px] max-w-[calc(100vw-2rem)] rounded-[1.75rem] bg-white p-5 text-left coastal-shadow">
            <div className="space-y-5">
              <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-on-surface">Adultos</p>
                  <p className="text-sm text-on-surface-variant">Desde 12 años</p>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-surface-container-low px-2 py-1">
                  <button
                    type="button"
                    onClick={() => updateAdults(adults - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-lg font-semibold text-primary transition hover:bg-surface-container-high"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-lg font-semibold text-on-surface">{adults}</span>
                  <button
                    type="button"
                    onClick={() => updateAdults(adults + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-lg font-semibold text-primary transition hover:bg-surface-container-high"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-on-surface">Niños</p>
                  <p className="text-sm text-on-surface-variant">De 0 a 11 años</p>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-surface-container-low px-2 py-1">
                  <button
                    type="button"
                    onClick={() => updateChildren(children - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-lg font-semibold text-primary transition hover:bg-surface-container-high"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-lg font-semibold text-on-surface">{children}</span>
                  <button
                    type="button"
                    onClick={() => updateChildren(children + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-lg font-semibold text-primary transition hover:bg-surface-container-high"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPassengers(false)}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
              >
                Listo
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => submitSearch()}
        className="flex items-center justify-center gap-2 rounded-full bg-secondary-container px-8 py-4 font-semibold text-on-secondary-container transition-colors hover:bg-yellow-300"
      >
        <span className="material-symbols-outlined">search</span>
        <span>Buscar</span>
      </button>
    </div>
  );
}
