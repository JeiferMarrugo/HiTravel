import { AdminWhatsAppHub } from "@/components/admin/whatsapp/admin-whatsapp-hub";
import { getFallbackSessionId } from "@/lib/openwa";

export default function AdminWhatsAppPage() {
  return <AdminWhatsAppHub fallbackSessionId={getFallbackSessionId() ?? null} />;
}
