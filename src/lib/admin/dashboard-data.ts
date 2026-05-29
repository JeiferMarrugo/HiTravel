import type { DashboardStat, Departure, PendingItem } from "@/lib/admin/types";

export const dashboardStats: DashboardStat[] = [
  {
    label: "Ingresos de la semana",
    value: "$12.450",
    icon: "bar_chart",
  },
];

export const departuresToday: Departure[] = [
  {
    id: "dep-1",
    title: "Catamarán Premium Islas del Rosario",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBpxYdzRanvgvQJdgAqKqLAc1d0QM964KNbNm1PhZif3-sr1jUkgrVYKU3OD5l_arpotmagdCLc5I8GTutri4rpu7OpsgLPAxiynIKL9FKZxGrNDagDo8bySrmJdpU1y_k7W5xr71lD_j2ellxDVFpMJA0ZtzMeuxhHQVnF6CiHxWCVBL2iT-CTkuWNMhd8WzPOJNG8DOAOAZQvBeOfuVWTewFSnJnHzyRdK7eWIJiVX2TjjROQshJEz4B5f3DMki7zi2-XC9ZMLw",
    time: "08:30 AM",
    meetingPoint: "Muelle de la Bodeguita",
    passengers: "24 / 30",
    statusLabel: "pasajeros",
  },
  {
    id: "dep-2",
    title: "Walking Tour Privado Ciudad Colonial",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-Ck5rjAyuOyvHd12megAjWM6-PPA3G60XJRo82uqLZRcpjhNTN5nk0r1kKSI918VtnCSexIunynXyFyrwLA9N1wxOb-DbEelzIeU4JvOyfTNHh_iRXbcgqP4uo1C8zOqwmQDY2Si5CKnKl1pjMN5jujDt1AN-pEaYO9b-1ju8Z2SWXLHCylNqorbrXvRAHg5Zxuo_VnXIi7AuKlwZ7fmH70QlekeX81_p0WiX9R0MGF20pNfa8AwBDpaFRNy98NfuwA3NGfmInw",
    time: "09:00 AM",
    meetingPoint: "Torre del Reloj",
    passengers: "12 / 12",
    statusLabel: "completo",
  },
  {
    id: "dep-3",
    title: "Experiencia Sunset Bay & Cocktails",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAc5ZAjsEru0vKU6CnDSwbMX16E2JKsWeP98_wfzX5fwt__zKuNIhPDZUA_FOCLB5VekK6rAHWbpMhPg6sDuby0womTuXvEmHjrdPXdjkUFX8APweWsWSPMTW-PXW2IeUkUETWVfOWtj3gpilCBGgtwdynEM5m_zzidHdC2aEXhUaVbrqqPevycv__xp3feMZJIceCr7YXrg7KablxruQizu5jHQNQCAxRxbIEsz6CqVUcbwkY7yuEGqQ9EUwH_88lFjcUoHujk-w",
    time: "04:30 PM",
    meetingPoint: "Marina Santa Cruz",
    passengers: "18 / 45",
    statusLabel: "pasajeros",
  },
];

export const pendingItems: PendingItem[] = [
  {
    id: "pending-1",
    customer: "Mark Thompson",
    product: "Private Yacht Charter",
    amount: "$1.200",
    urgency: "Acción requerida",
  },
  {
    id: "pending-2",
    customer: "Elena Rodríguez",
    product: "Mud Volcano Tour (x4)",
    amount: "$380",
  },
  {
    id: "pending-3",
    customer: "Consulta de agencia",
    product: "Viajero JJ Smith",
    amount: "--",
    note: "Solicitó devolución de llamada por WhatsApp para tarifas de grupo.",
  },
];

export const quickActions = [
  {
    title: "Nueva reserva",
    description: "Registra un nuevo viajero",
    icon: "add_circle",
    href: "/admin/reservas",
  },
  {
    title: "Nuevo tour",
    description: "Crea un itinerario personalizado",
    icon: "explore",
    href: "/admin/tours/nuevo",
  },
  {
    title: "Generar reporte",
    description: "Resumen diario de operaciones",
    icon: "description",
    href: "/admin/tarifas",
  },
];
