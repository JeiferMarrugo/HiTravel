import { AdminWhatsAppHub, type AdminWhatsAppHubTab } from "@/components/admin/whatsapp/admin-whatsapp-hub";
import { getFallbackSessionId, listSessions } from "@/lib/openwa";

export const dynamic = "force-dynamic";

const validTabs = new Set<AdminWhatsAppHubTab>(["inbox", "sessions", "groups", "contacts", "webhooks", "stats"]);

function resolveInitialTab(tab?: string): AdminWhatsAppHubTab {
  if (tab && validTabs.has(tab as AdminWhatsAppHubTab)) {
    return tab as AdminWhatsAppHubTab;
  }

  return "inbox";
}

function resolveFallbackSessionId(
  sessions: Awaited<ReturnType<typeof listSessions>>,
  configuredSessionId?: string | null,
) {
  if (configuredSessionId && sessions.some((session) => session.id === configuredSessionId)) {
    return configuredSessionId;
  }

  return sessions.find((session) => session.status === "ready")?.id ?? sessions[0]?.id ?? configuredSessionId ?? null;
}

export default async function AdminWhatsAppPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const initialTab = resolveInitialTab(params.tab);

  let initialSessions: Awaited<ReturnType<typeof listSessions>> = [];

  try {
    initialSessions = await listSessions();
  } catch {
    initialSessions = [];
  }

  const fallbackSessionId = resolveFallbackSessionId(initialSessions, getFallbackSessionId());

  return (
    <AdminWhatsAppHub
      fallbackSessionId={fallbackSessionId}
      initialSessions={initialSessions}
      initialTab={initialTab}
    />
  );
}
