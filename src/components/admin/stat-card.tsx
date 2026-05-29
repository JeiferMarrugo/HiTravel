import type { DashboardStat } from "@/lib/admin/types";

type StatCardProps = {
  stat: DashboardStat;
};

const toneClasses = {
  default: "text-primary bg-blue-50",
  positive: "text-green-700 bg-green-50",
  warning: "text-yellow-700 bg-yellow-50",
  danger: "text-red-700 bg-red-50",
};

export function StatCard({ stat }: StatCardProps) {
  const tone = stat.tone ?? "default";

  return (
    <article className="rounded-[1.75rem] bg-white p-5 coastal-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
          <span className="material-symbols-outlined">{stat.icon}</span>
        </div>
        {stat.change ? <span className="text-sm font-semibold text-green-600">{stat.change}</span> : null}
      </div>
      <p className="mt-5 text-sm text-on-surface-variant">{stat.label}</p>
      <p className="mt-2 text-[22px] font-bold text-primary">{stat.value}</p>
    </article>
  );
}
