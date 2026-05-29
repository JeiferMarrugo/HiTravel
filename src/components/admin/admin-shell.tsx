import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { WhatsappFab } from "@/components/site-chrome";

type AdminShellProps = {
  children: ReactNode;
  searchPlaceholder?: string;
  userName?: string;
  userRole?: string;
};

export function AdminShell({ children, searchPlaceholder, userName, userRole }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopbar placeholder={searchPlaceholder} userName={userName} userRole={userRole} />
          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
      <WhatsappFab />
    </div>
  );
}
