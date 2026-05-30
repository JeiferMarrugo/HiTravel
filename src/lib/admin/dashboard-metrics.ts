import { query } from "@/lib/db";
import { formatMoneyDisplay } from "@/lib/catalog/money";
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

export type DashboardMetricsPayload = {
  stats: DashboardStat[];
  monthlySales: SalesDataPoint[];
  bookingChannels: BookingChannelMetric[];
  tourRevenueMetrics: TourRevenueMetric[];
  topClients: TopClientMetric[];
  recentSales: RecentSaleRow[];
  departuresToday: Departure[];
  pendingItems: PendingItem[];
};

const CHANNEL_COLORS: Record<string, string> = {
  website: "#001e40",
  admin: "#745b00",
  whatsapp: "#fecb00",
};

function formatShortDate(iso: Date | string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function getDashboardMetrics(): Promise<DashboardMetricsPayload> {
  const [statsRow, monthlyRows, channelRows, tourRows, clientRows, recentRows, departureRows, pendingRows] =
    await Promise.all([
      query<{
        month_revenue: string;
        month_bookings: string;
        active_customers: string;
        confirmed: string;
        avg_ticket: string;
        travelers_attended: string;
      }>(`
        SELECT
          COALESCE(SUM(pay.amount_cents) FILTER (
            WHERE pay.paid_at >= date_trunc('month', CURRENT_DATE)
          ), 0)::text AS month_revenue,
          COUNT(DISTINCT b.id) FILTER (
            WHERE b.created_at >= date_trunc('month', CURRENT_DATE)
          )::text AS month_bookings,
          COUNT(DISTINCT b.customer_phone) FILTER (
            WHERE b.approval_status = 'confirmed'
          )::text AS active_customers,
          COUNT(*) FILTER (WHERE b.approval_status = 'confirmed')::text AS confirmed,
          COALESCE(AVG(b.amount_cents) FILTER (WHERE b.amount_cents > 0), 0)::text AS avg_ticket,
          COALESCE(SUM(b.adults + b.children) FILTER (WHERE b.customer_attended_at IS NOT NULL), 0)::text AS travelers_attended
        FROM bookings b
        LEFT JOIN booking_payments pay ON pay.booking_id = b.id
      `),
      query<{ month_label: string; sales: string; bookings: string }>(`
        SELECT
          to_char(m.month_start, 'Mon') AS month_label,
          COALESCE(SUM(pay.amount_cents), 0)::text AS sales,
          COUNT(DISTINCT b.id)::text AS bookings
        FROM generate_series(
          date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
          date_trunc('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) AS m(month_start)
        LEFT JOIN bookings b ON date_trunc('month', b.created_at) = m.month_start
        LEFT JOIN booking_payments pay ON pay.booking_id = b.id
          AND date_trunc('month', pay.paid_at) = m.month_start
        GROUP BY m.month_start
        ORDER BY m.month_start ASC
      `),
      query<{ source: string; total: string }>(`
        SELECT COALESCE(NULLIF(booking_source, ''), 'admin') AS source, COUNT(*)::text AS total
        FROM bookings
        GROUP BY 1
        ORDER BY total DESC
      `),
      query<{ tour_name: string; revenue: string; bookings: string }>(`
        SELECT
          b.tour_name,
          COALESCE(SUM(pay.amount_cents), 0)::text AS revenue,
          COUNT(DISTINCT b.id)::text AS bookings
        FROM bookings b
        LEFT JOIN booking_payments pay ON pay.booking_id = b.id
        WHERE b.approval_status != 'cancelled'
        GROUP BY b.tour_name
        ORDER BY revenue DESC
        LIMIT 5
      `),
      query<{
        customer_name: string;
        customer_email: string | null;
        customer_phone: string;
        bookings: string;
        total_spent: string;
        last_booking: Date;
      }>(`
        SELECT
          customer_name,
          customer_email,
          customer_phone,
          COUNT(*)::text AS bookings,
          COALESCE(SUM(amount_cents), 0)::text AS total_spent,
          MAX(created_at) AS last_booking
        FROM bookings
        WHERE approval_status = 'confirmed'
        GROUP BY customer_name, customer_email, customer_phone
        ORDER BY total_spent DESC
        LIMIT 5
      `),
      query<{
        id: string;
        booking_code: string;
        customer_name: string;
        tour_name: string;
        amount_cents: number | null;
        currency: string;
        payment_status: string;
        approval_status: string;
        created_at: Date;
      }>(`
        SELECT id, booking_code, customer_name, tour_name, amount_cents, currency, payment_status, approval_status, created_at
        FROM bookings
        ORDER BY created_at DESC
        LIMIT 6
      `),
      query<{
        id: string;
        booking_code: string;
        customer_name: string;
        tour_name: string;
        checkin_at: Date;
        adults: number;
        children: number;
      }>(`
        SELECT id, booking_code, customer_name, tour_name, checkin_at, adults, children
        FROM bookings
        WHERE checkin_at::date = CURRENT_DATE
          AND approval_status = 'confirmed'
        ORDER BY checkin_at ASC
        LIMIT 8
      `),
      query<{
        id: string;
        booking_code: string;
        customer_name: string;
        tour_name: string;
        created_at: Date;
      }>(`
        SELECT id, booking_code, customer_name, tour_name, created_at
        FROM bookings
        WHERE approval_status = 'pending'
        ORDER BY created_at ASC
        LIMIT 6
      `),
    ]);

  const stats = statsRow[0];
  const monthRevenue = Number(stats?.month_revenue ?? 0);
  const avgTicket = Number(stats?.avg_ticket ?? 0);

  const dashboardStats: DashboardStat[] = [
    {
      label: "Ingresos del mes",
      value: formatMoneyDisplay(monthRevenue, "COP"),
      icon: "payments",
      change: `${Number(stats?.month_bookings ?? 0)} reservas`,
      tone: "positive",
    },
    {
      label: "Clientes confirmados",
      value: String(Number(stats?.active_customers ?? 0)),
      icon: "groups",
      change: `${Number(stats?.confirmed ?? 0)} reservas activas`,
      tone: "default",
    },
    {
      label: "Viajeros atendidos",
      value: String(Number(stats?.travelers_attended ?? 0)),
      icon: "hiking",
      change: "Personas marcadas como atendidas",
      tone: "positive",
    },
    {
      label: "Ticket promedio",
      value: formatMoneyDisplay(avgTicket, "COP"),
      icon: "sell",
      change: "Por reserva con total",
      tone: "default",
    },
  ];

  const channelTotal = channelRows.reduce((sum, row) => sum + Number(row.total), 0) || 1;
  const bookingChannels: BookingChannelMetric[] = channelRows.map((row) => ({
    name: row.source === "website" ? "Sitio web" : row.source === "admin" ? "Admin" : row.source,
    value: Math.round((Number(row.total) / channelTotal) * 100),
    color: CHANNEL_COLORS[row.source] ?? "#00a6e4",
  }));

  return {
    stats: dashboardStats,
    monthlySales: monthlyRows.map((row) => ({
      month: row.month_label,
      sales: Number(row.sales),
      bookings: Number(row.bookings),
    })),
    bookingChannels,
    tourRevenueMetrics: tourRows.map((row) => ({
      tour: row.tour_name,
      revenue: Number(row.revenue),
      bookings: Number(row.bookings),
    })),
    topClients: clientRows.map((row, index) => ({
      id: `cli-${index}`,
      name: row.customer_name,
      email: row.customer_email ?? row.customer_phone,
      bookings: Number(row.bookings),
      totalSpent: Number(row.total_spent),
      lastBooking: formatShortDate(row.last_booking),
    })),
    recentSales: recentRows.map((row) => ({
      id: row.booking_code,
      customer: row.customer_name,
      tour: row.tour_name,
      date: formatShortDate(row.created_at),
      amount: row.amount_cents ?? 0,
      paymentStatus:
        row.payment_status === "paid" || row.payment_status === "refunded"
          ? row.payment_status
          : "pending",
      approvalStatus: row.approval_status as "confirmed" | "pending" | "cancelled",
    })),
    departuresToday: departureRows.map((row) => ({
      id: row.id,
      title: row.tour_name,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop",
      time: new Date(row.checkin_at).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      meetingPoint: row.booking_code,
      passengers: String(row.adults + row.children),
      statusLabel: "pasajeros",
    })),
    pendingItems: pendingRows.map((row) => ({
      id: row.id,
      customer: row.customer_name,
      product: row.tour_name,
      amount: row.booking_code,
      note: `Pendiente de confirmación desde ${formatShortDate(row.created_at)}`,
      urgency: "Alta",
    })),
  };
}
