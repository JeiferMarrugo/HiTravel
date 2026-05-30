"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";

type AdminShellProps = {
  children: ReactNode;
  searchPlaceholder?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
};

export function AdminShell({ children, searchPlaceholder, userEmail, userName, userRole }: AdminShellProps) {
  useAdminSessionGuard();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopbar placeholder={searchPlaceholder} userEmail={userEmail} userName={userName} userRole={userRole} />
          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
