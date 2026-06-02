"use client";

import type { ReactNode } from "react";
import { AdminFetchBootstrap } from "@/components/admin/admin-fetch-bootstrap";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
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
    <div className="min-h-screen overflow-x-hidden bg-background text-on-surface">
      <AdminFetchBootstrap />
      <AdminMobileNav />
      <div className="flex min-h-screen min-w-0">
        <AdminSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AdminTopbar placeholder={searchPlaceholder} userEmail={userEmail} userName={userName} userRole={userRole} />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
