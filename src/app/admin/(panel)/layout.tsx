import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentSessionUser } from "@/lib/auth/session";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentSessionUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <AdminShell userEmail={user.email} userName={user.name} userRole={user.role}>
      {children}
    </AdminShell>
  );
}
