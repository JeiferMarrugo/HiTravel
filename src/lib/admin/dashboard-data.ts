import type {
  BookingChannelMetric,
  DashboardStat,
  Departure,
  PendingItem,
  RecentSaleRow,
  SalesDataPoint,
  TopClientMetric,
  TourRevenueMetric,
} from "@/lib/admin/types";

export const dashboardStats: DashboardStat[] = [
  {
    label: "Ventas del mes",
    value: "$48.250",
    icon: "payments",
    change: "+18.4%",
    tone: "positive",
  },
  {
    label: "Clientes activos",
    value: "1.284",
    icon: "groups",
    change: "+12%",
    tone: "default",
  },
  {
    label: "Reservas confirmadas",
    value: "186",
    icon: "confirmation_number",
    change: "+9.2%",
    tone: "positive",
  },
  {
    label: "Ticket promedio",
    value: "$259",
    icon: "sell",
    change: "+4.1%",
    tone: "default",
  },
];

export const monthlySales: SalesDataPoint[] = [
  { month: "Ene", sales: 28400, bookings: 98 },
  { month: "Feb", sales: 31200, bookings: 112 },
  { month: "Mar", sales: 36800, bookings: 128 },
  { month: "Abr", sales: 42100, bookings: 145 },
  { month: "May", sales: 39500, bookings: 138 },
  { month: "Jun", sales: 48250, bookings: 186 },
];

export const tourRevenueMetrics: TourRevenueMetric[] = [
  { tour: "Islas del Rosario VIP", revenue: 14200, bookings: 48 },
  { tour: "Cartagena Histórica", revenue: 9800, bookings: 62 },
  { tour: "Tayrona Aventura", revenue: 8600, bookings: 34 },
  { tour: "Playa Barú", revenue: 7200, bookings: 28 },
  { tour: "Sunset Catamarán", revenue: 8450, bookings: 14 },
];

export const bookingChannels: BookingChannelMetric[] = [
  { name: "Sitio web", value: 42, color: "#001e40" },
  { name: "WhatsApp", value: 31, color: "#fecb00" },
  { name: "Agencias", value: 18, color: "#00a6e4" },
  { name: "Referidos", value: 9, color: "#745b00" },
];

export const topClients: TopClientMetric[] = [
  {
    id: "cli-1",
    name: "María Sánchez",
    email: "maria.sanchez@email.com",
    bookings: 12,
    totalSpent: 3240,
    lastBooking: "28 may 2026",
  },
  {
    id: "cli-2",
    name: "John Doe",
    email: "john.doe@email.com",
    bookings: 8,
    totalSpent: 2180,
    lastBooking: "27 may 2026",
  },
  {
    id: "cli-3",
    name: "Claire Laurent",
    email: "claire.l@email.com",
    bookings: 6,
    totalSpent: 1950,
    lastBooking: "25 may 2026",
  },
  {
    id: "cli-4",
    name: "Robert King",
    email: "robert.king@email.com",
    bookings: 5,
    totalSpent: 1420,
    lastBooking: "24 may 2026",
  },
  {
    id: "cli-5",
    name: "Elena Rodríguez",
    email: "elena.r@email.com",
    bookings: 4,
    totalSpent: 1180,
    lastBooking: "22 may 2026",
  },
];

export const recentSales: RecentSaleRow[] = [
  {
    id: "#HT-9821",
    customer: "María Sánchez",
    tour: "Rosario Islands Day Trip",
    date: "29 may 2026",
    amount: 125,
    paymentStatus: "paid",
    approvalStatus: "confirmed",
  },
  {
    id: "#HT-9822",
    customer: "John Doe",
    tour: "Old City Food Tour",
    date: "29 may 2026",
    amount: 65,
    paymentStatus: "pending",
    approvalStatus: "pending",
  },
  {
    id: "#HT-9823",
    customer: "Claire Laurent",
    tour: "Sunset Catamaran Cruise",
    date: "28 may 2026",
    amount: 210,
    paymentStatus: "paid",
    approvalStatus: "confirmed",
  },
  {
    id: "#HT-9824",
    customer: "Robert King",
    tour: "Mangrove Kayaking",
    date: "28 may 2026",
    amount: 45,
    paymentStatus: "paid",
    approvalStatus: "confirmed",
  },
  {
    id: "#HT-9825",
    customer: "Mark Thompson",
    tour: "Private Yacht Charter",
    date: "27 may 2026",
    amount: 1200,
    paymentStatus: "pending",
    approvalStatus: "pending",
  },
  {
    id: "#HT-9826",
    customer: "Elena Rodríguez",
    tour: "Mud Volcano Tour",
    date: "27 may 2026",
    amount: 380,
    paymentStatus: "refunded",
    approvalStatus: "cancelled",
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
    href: "/admin/tours",
  },
  {
    title: "Generar reporte",
    description: "Resumen diario de operaciones",
    icon: "description",
    href: "/admin/tarifas",
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
