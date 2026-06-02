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
import { formatMoneyDisplay } from "@/lib/catalog/money";

const CHART_PRIMARY = "#001e40";
const CHART_ACCENT = "#fecb00";
const CHART_GRID = "#e6e8ea";

type DashboardSalesChartProps = {
  data: SalesDataPoint[];
};

export function DashboardSalesChart({ data }: DashboardSalesChartProps) {
  return (
    <div className="h-[240px] w-full min-w-0 max-w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
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
          tickFormatter={(value: number) => {
            if (value >= 1_000_000) {
              return `$${Math.round(value / 1_000_000)}M`;
            }
            if (value >= 1_000) {
              return `$${Math.round(value / 1_000)}k`;
            }
            return `$${value}`;
          }}
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
              return [formatMoneyDisplay(numericValue, "COP"), "Ventas"];
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
    </div>
  );
}

type DashboardToursChartProps = {
  data: TourRevenueMetric[];
};

export function DashboardToursChart({ data }: DashboardToursChartProps) {
  return (
    <div className="h-[240px] w-full min-w-0 max-w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} strokeDasharray="4 4" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#43474f", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => {
            if (value >= 1_000_000) {
              return `$${Math.round(value / 1_000_000)}M`;
            }
            if (value >= 1_000) {
              return `$${Math.round(value / 1_000)}k`;
            }
            return `$${value}`;
          }}
        />
        <YAxis
          type="category"
          dataKey="tour"
          width={72}
          tick={{ fill: "#43474f", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid #e0e3e5",
            boxShadow: "0 10px 30px -5px rgba(0, 51, 102, 0.08)",
          }}
          formatter={(value) => [
            formatMoneyDisplay(typeof value === "number" ? value : Number(value ?? 0), "COP"),
            "Ingresos",
          ]}
        />
        <Bar dataKey="revenue" fill={CHART_ACCENT} radius={[0, 10, 10, 0]} barSize={18} />
      </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type DashboardChannelsChartProps = {
  data: BookingChannelMetric[];
};

export function DashboardChannelsChart({ data }: DashboardChannelsChartProps) {
  return (
    <div className="mx-auto h-[220px] w-full min-w-0 max-w-full sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
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
    </div>
  );
}
