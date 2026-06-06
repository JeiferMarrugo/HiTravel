"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { PUBLIC_PAGE_SHELL } from "@/lib/public-page-layout";
import type { DisplayCurrency } from "@/lib/pricing/visitor-currency";
import type { SiteContent } from "@/lib/site-content/types";

type ActiveNav = "tours" | "about" | "contact";

const navItems = [
  { key: "tours", label: "Tours", href: "/tours" },
  { key: "day-trips", label: "Pasadías", href: "/tours" },
  { key: "about", label: "Sobre nosotros", href: "/nosotros" },
  { key: "contact", label: "Contacto", href: "/contacto" },
] as const;

type TopNavBarProps = {
  content: SiteContent;
  active: ActiveNav;
  displayCurrency?: DisplayCurrency;
};

function desktopNavClass(isActive: boolean) {
  const base =
    "relative whitespace-nowrap py-1 text-[13px] font-medium tracking-wide text-on-surface-variant transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary/50 after:transition-transform after:duration-200 hover:text-primary hover:after:scale-x-100 xl:text-sm";

  return isActive ? `${base} font-semibold text-primary after:scale-x-100 after:bg-primary` : base;
}

export function TopNavBar({ content, active, displayCurrency = "COP" }: TopNavBarProps) {
  const menuToggleRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleId = useId().replace(/:/g, "");
  const panelId = useId();

  function closeMenu() {
    const toggle = menuToggleRef.current;
    if (!toggle?.checked) {
      return;
    }
    toggle.checked = false;
    setMenuOpen(false);
    document.body.style.overflow = "";
  }

  useEffect(() => {
    const toggle = menuToggleRef.current;
    if (!toggle) {
      return;
    }

    function syncMenuState() {
      if (!toggle) {
        return;
      }
      const checked = toggle.checked;
      setMenuOpen(checked);
      document.body.style.overflow = checked ? "hidden" : "";
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    toggle.addEventListener("change", syncMenuState);
    document.addEventListener("keydown", onEscape);
    return () => {
      toggle.removeEventListener("change", syncMenuState);
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <header className="pointer-events-auto fixed top-0 left-0 z-[10050] isolate w-full border-b border-neutral-200/70 bg-white/95 shadow-[0_1px_8px_rgba(15,23,42,0.06)] backdrop-blur-md">
      <input
        ref={menuToggleRef}
        id={menuToggleId}
        type="checkbox"
        className="peer/menu sr-only"
        tabIndex={-1}
        aria-hidden
      />

      <nav className={`relative z-[1] flex h-14 items-center justify-between gap-4 sm:h-16 ${PUBLIC_PAGE_SHELL}`}>
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2.5 transition-opacity hover:opacity-85 sm:gap-3"
          >
            <BrandLogo
              name={content.brand.name}
              logoUrl={content.brand.logoUrl}
              className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
              width={40}
              height={40}
            />
            <span className="truncate text-base font-extrabold tracking-tight text-primary sm:text-lg">
              {content.brand.name}
            </span>
          </Link>

        <div className="hidden items-center gap-5 lg:flex xl:gap-6">
          <div className="flex items-center gap-5 xl:gap-7">
            {navItems.map((item) => {
              const isActive = item.key === active;
              return (
                <Link key={item.key} href={item.href} className={desktopNavClass(isActive)}>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <span className="h-4 w-px shrink-0 bg-neutral-200" aria-hidden />

          <CurrencySwitcher initialCurrency={displayCurrency} />

          <Link
            href="/contacto"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary/90 xl:h-11 xl:px-6"
          >
            {content.brand.navCtaLabel}
          </Link>
        </div>

        <div className="relative z-[2] flex shrink-0 items-center gap-2.5 lg:hidden">
          <CurrencySwitcher initialCurrency={displayCurrency} />

          <label
            htmlFor={menuToggleId}
            className="relative z-[2] flex h-11 w-11 cursor-pointer touch-manipulation select-none items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-primary shadow-sm transition active:scale-[0.97]"
            aria-controls={panelId}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <span className="material-symbols-outlined pointer-events-none text-[24px]">
              {menuOpen ? "close" : "menu"}
            </span>
          </label>
        </div>
      </nav>

      <label
        htmlFor={menuToggleId}
        className="fixed inset-0 top-14 z-[10051] hidden cursor-default bg-black/35 peer-checked/menu:block lg:hidden"
        aria-label="Cerrar menú"
      />

      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="fixed inset-x-0 top-14 z-[10052] hidden max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-neutral-100 bg-white py-5 shadow-lg peer-checked/menu:block lg:hidden"
      >
        <nav className={`flex flex-col gap-1 ${PUBLIC_PAGE_SHELL}`}>
          {navItems.map((item) => {
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={closeMenu}
                className={`rounded-xl px-4 py-3.5 text-[15px] font-medium transition ${
                  isActive
                    ? "bg-primary/8 font-semibold text-primary"
                    : "text-on-surface-variant active:bg-neutral-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/contacto"
            onClick={closeMenu}
            className="mt-2 inline-flex min-h-[48px] items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-on-primary shadow-sm"
          >
            {content.brand.navCtaLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
