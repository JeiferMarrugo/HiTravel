"use client";

import Link from "next/link";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { ADMIN_MOBILE_NAV_TOGGLE_ID } from "@/components/admin/admin-mobile-nav";

type AdminTopbarProps = {
  placeholder?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
};

export function AdminTopbar({
  placeholder = "Buscar reservas, clientes o tours...",
  userEmail = "admin@hitravel.com",
  userName = "Administrador",
  userRole = "Admin",
}: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-background/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-10 lg:py-4">
        <label
          htmlFor={ADMIN_MOBILE_NAV_TOGGLE_ID}
          className="flex h-11 w-11 shrink-0 cursor-pointer touch-manipulation select-none items-center justify-center rounded-full border border-outline-variant/20 bg-white text-primary shadow-sm transition active:scale-[0.97] lg:hidden"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined pointer-events-none text-[24px]">menu</span>
        </label>

        <Link href="/admin" className="min-w-0 shrink-0 lg:hidden">
          <p className="truncate text-sm font-extrabold text-primary">HI TRAVEL</p>
          <p className="truncate text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Admin</p>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <div className="mx-auto flex max-w-md items-center gap-3 rounded-full bg-white px-4 py-3 coastal-shadow">
            <span className="material-symbols-outlined shrink-0 text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder={placeholder}
              className="min-w-0 flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden rounded-full bg-white p-2.5 text-on-surface coastal-shadow sm:inline-flex"
            aria-label="Notificaciones"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
          </button>
          <button
            type="button"
            className="hidden rounded-full bg-white p-2.5 text-on-surface coastal-shadow md:inline-flex"
            aria-label="Ayuda"
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
          </button>
          <div className="border-l border-outline-variant/30 pl-2 sm:pl-4">
            <AdminUserMenu userEmail={userEmail} userName={userName} userRole={userRole} />
          </div>
        </div>
      </div>
    </header>
  );
}
