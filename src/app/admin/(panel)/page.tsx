import { AdminDashboard } from "@/components/admin/dashboard/admin-dashboard";
import { getDashboardMetrics } from "@/lib/admin/dashboard-metrics";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const initialMetrics = await getDashboardMetrics();

  return <AdminDashboard initialMetrics={initialMetrics} />;
}
