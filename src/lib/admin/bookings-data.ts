import type { Booking, DashboardStat } from "@/lib/admin/types";

export const bookingStats: DashboardStat[] = [
  { label: "Reservas totales", value: "1.284", icon: "confirmation_number", change: "+12%", tone: "positive" },
  { label: "Pendientes de aprobación", value: "42", icon: "assignment_late", tone: "warning" },
  { label: "Volumen bruto", value: "$48.2k", icon: "payments", tone: "default" },
  { label: "Cancelaciones", value: "08", icon: "event_busy", tone: "danger" },
];

export const bookingFilters = [
  "Todos los estados",
  "Pago confirmado",
  "Pago pendiente",
  "Oct 1, 2023 - Oct 31, 2023",
];

export const bookings: Booking[] = [
  {
    id: "#HT-9821",
    customer: "Maria Sanchez",
    customerCode: "MS",
    customerTone: "blue",
    tourName: "Rosario Islands Day Trip",
    tag: "Pasadía",
    date: "24 Oct, 2023",
    amount: "$125.00",
    paymentStatus: "paid",
    approvalStatus: "confirmed",
  },
  {
    id: "#HT-9822",
    customer: "John Doe",
    customerCode: "JD",
    customerTone: "yellow",
    tourName: "Old City Food Tour",
    date: "25 Oct, 2023",
    amount: "$65.00",
    paymentStatus: "pending",
    approvalStatus: "pending",
  },
  {
    id: "#HT-9823",
    customer: "Claire Laurent",
    customerCode: "CL",
    customerTone: "dark",
    tourName: "Sunset Catamaran Cruise",
    tag: "Premium",
    date: "26 Oct, 2023",
    amount: "$210.00",
    paymentStatus: "refunded",
    approvalStatus: "cancelled",
  },
  {
    id: "#HT-9824",
    customer: "Robert King",
    customerCode: "RK",
    customerTone: "olive",
    tourName: "Mangrove Kayaking",
    date: "28 Oct, 2023",
    amount: "$45.00",
    paymentStatus: "paid",
    approvalStatus: "confirmed",
  },
];
