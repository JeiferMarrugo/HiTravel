"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { adminNavItems, isAdminNavActive } from "@/lib/admin/nav-items";

export const ADMIN_MOBILE_NAV_TOGGLE_ID = "admin-mobile-nav-toggle";

function closeMobileNav() {
  const toggle = document.getElementById(ADMIN_MOBILE_NAV_TOGGLE_ID) as HTMLInputElement | null;
  if (toggle) {
    toggle.checked = false;
    document.body.style.overflow = "";
  }
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <>
      <input
        id={ADMIN_MOBILE_NAV_TOGGLE_ID}
        type="checkbox"
        className="peer/nav sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          document.body.style.overflow = event.currentTarget.checked ? "hidden" : "";
        }}
      />

      <label
        htmlFor={ADMIN_MOBILE_NAV_TOGGLE_ID}
        className="fixed inset-0 z-[60] hidden cursor-default bg-black/40 peer-checked/nav:block lg:hidden"
        aria-label="Cerrar menú"
      />

      <aside
        className="fixed inset-y-0 left-0 z-[70] flex w-[min(288px,88vw)] -translate-x-full flex-col bg-primary px-4 py-6 text-white shadow-2xl transition-transform duration-200 peer-checked/nav:translate-x-0 lg:hidden"
        aria-label="Menú de administración"
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" onClick={closeMobileNav} className="block">
            <p className="text-[18px] font-extrabold tracking-tight text-secondary-container">HI TRAVEL</p>
            <p className="mt-1 text-xs text-white/70">Admin Console</p>
          </Link>
          <label
            htmlFor={ADMIN_MOBILE_NAV_TOGGLE_ID}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10"
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </label>
        </div>

        <nav className="mt-8 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const active = isAdminNavActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileNav}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition ${
                  active ? "bg-secondary-container text-primary shadow-lg" : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-white/10 pt-6">
          <Link
            href="/admin/reservas"
            onClick={closeMobileNav}
            className="flex items-center justify-center gap-2 rounded-2xl bg-secondary-container px-4 py-4 text-sm font-semibold text-primary shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva reserva
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>
    </>
  );
}
