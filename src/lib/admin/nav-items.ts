import type { AdminNavItem } from "@/lib/admin/types";

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard", match: "exact" },
  { label: "Reservas", href: "/admin/reservas", icon: "calendar_month", match: "startsWith" },
  { label: "Pagos", href: "/admin/pagos", icon: "payments", match: "startsWith" },
  { label: "Promociones", href: "/admin/promociones", icon: "sell", match: "startsWith" },
  { label: "Tours", href: "/admin/tours", icon: "explore", match: "startsWith" },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: "forum", match: "startsWith" },
  { label: "Configuración", href: "/admin/configuracion", icon: "settings", match: "startsWith" },
];

export function isAdminNavActive(pathname: string, item: AdminNavItem) {
  if (item.match === "exact") {
    return pathname === item.href;
  }

  return pathname.startsWith(item.href);
}
