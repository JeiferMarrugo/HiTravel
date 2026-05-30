"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BookingChannelMetric, SalesDataPoint, TourRevenueMetric } from "@/lib/admin/types";
import { formatCurrency } from "@/lib/admin/dashboard-data";

const CHART_PRIMARY = "#001e40";
const CHART_ACCENT = "#fecb00";
const CHART_GRID = "#e6e8ea";

type DashboardSalesChartProps = {
  data: SalesDataPoint[];
};

export function DashboardSalesChart({ data }: DashboardSalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.25} />
            <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_GRID} strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#43474f", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "#43474f", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid #e0e3e5",
            boxShadow: "0 10px 30px -5px rgba(0, 51, 102, 0.08)",
          }}
          formatter={(value, name) => {
            const numericValue = typeof value === "number" ? value : Number(value ?? 0);
            if (name === "sales") {
              return [formatCurrency(numericValue), "Ventas"];
            }
            return [numericValue, "Reservas"];
          }}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke={CHART_PRIMARY}
          strokeWidth={3}
          fill="url(#salesGradient)"
          name="sales"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

type DashboardToursChartProps = {
  data: TourRevenueMetric[];
};

export function DashboardToursChart({ data }: DashboardToursChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} strokeDasharray="4 4" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#43474f", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
        />
        <YAxis
          type="category"
          dataKey="tour"
          width={130}
          tick={{ fill: "#43474f", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid #e0e3e5",
            boxShadow: "0 10px 30px -5px rgba(0, 51, 102, 0.08)",
          }}
          formatter={(value) => [formatCurrency(typeof value === "number" ? value : Number(value ?? 0)), "Ingresos"]}
        />
        <Bar dataKey="revenue" fill={CHART_ACCENT} radius={[0, 10, 10, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

type DashboardChannelsChartProps = {
  data: BookingChannelMetric[];
};

export function DashboardChannelsChart({ data }: DashboardChannelsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={62} outerRadius={96} paddingAngle={4}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid #e0e3e5",
            boxShadow: "0 10px 30px -5px rgba(0, 51, 102, 0.08)",
          }}
          formatter={(value) => [`${typeof value === "number" ? value : Number(value ?? 0)}%`, "Participación"]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
