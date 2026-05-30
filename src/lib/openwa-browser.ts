import type {
  OpenWaContact,
  OpenWaGroup,
  OpenWaMessageStats,
  OpenWaMessagesResponse,
  OpenWaOverviewStats,
  OpenWaQrCode,
  OpenWaSession,
  OpenWaSessionStats,
  OpenWaWebhook,
} from "@/lib/admin/types";

type RequestOptions = {
  body?: unknown;
  method?: "GET" | "POST" | "PUT" | "DELETE";
};

type StatsRequestOptions =
  | {
      kind: "overview";
    }
  | {
      kind: "messages";
      period?: "24h" | "7d" | "30d";
    }
  | {
      kind: "session";
      sessionId: string;
    };

async function openWaBrowserRequest<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | T | null;

  if (!response.ok) {
    const apiError =
      (payload as { error?: string; message?: string } | null)?.error ??
      (payload as { error?: string; message?: string } | null)?.message;

    throw new Error(apiError ?? "No fue posible consultar OpenWA.");
  }

  return payload as T;
}

export function listOpenWaSessions() {
  return openWaBrowserRequest<OpenWaSession[]>("/api/openwa/sessions");
}

export function createOpenWaSession(name: string) {
  return openWaBrowserRequest<OpenWaSession>("/api/openwa/sessions", {
    method: "POST",
    body: {
      name,
    },
  });
}

export function getOpenWaSession(sessionId: string) {
  return openWaBrowserRequest<OpenWaSession>(`/api/openwa/sessions/${sessionId}`);
}

export function deleteOpenWaSession(sessionId: string) {
  return openWaBrowserRequest<{ ok: true }>(`/api/openwa/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export function startOpenWaSession(sessionId: string) {
  return openWaBrowserRequest<OpenWaSession>(`/api/openwa/sessions/${sessionId}/start`, {
    method: "POST",
  });
}

export function stopOpenWaSession(sessionId: string) {
  return openWaBrowserRequest<OpenWaSession>(`/api/openwa/sessions/${sessionId}/stop`, {
    method: "POST",
  });
}

export function getOpenWaQrCode(sessionId: string) {
  return openWaBrowserRequest<OpenWaQrCode>(`/api/openwa/sessions/${sessionId}/qr`);
}

export function listOpenWaMessages(sessionId: string, chatId?: string, limit = 100) {
  const params = new URLSearchParams({ limit: String(limit) });

  if (chatId) {
    params.set("chatId", chatId);
  }

  return openWaBrowserRequest<OpenWaMessagesResponse>(`/api/openwa/sessions/${sessionId}/messages?${params.toString()}`);
}

export function sendOpenWaText(sessionId: string, chatId: string, text: string) {
  return openWaBrowserRequest<{ messageId: string; timestamp: number }>(`/api/openwa/sessions/${sessionId}/messages`, {
    method: "POST",
    body: {
      action: "sendText",
      chatId,
      text,
    },
  });
}

export function replyOpenWaMessage(sessionId: string, chatId: string, quotedMessageId: string, text: string) {
  return openWaBrowserRequest<{ messageId: string; timestamp: number }>(`/api/openwa/sessions/${sessionId}/messages`, {
    method: "POST",
    body: {
      action: "reply",
      chatId,
      quotedMessageId,
      text,
    },
  });
}

export function reactOpenWaMessage(sessionId: string, chatId: string, messageId: string, emoji: string) {
  return openWaBrowserRequest<{ success: boolean }>(`/api/openwa/sessions/${sessionId}/messages`, {
    method: "POST",
    body: {
      action: "react",
      chatId,
      messageId,
      emoji,
    },
  });
}

export function deleteOpenWaMessage(sessionId: string, chatId: string, messageId: string, everyone = false) {
  return openWaBrowserRequest<{ success: boolean }>(`/api/openwa/sessions/${sessionId}/messages`, {
    method: "POST",
    body: {
      action: "delete",
      chatId,
      messageId,
      everyone,
    },
  });
}

export function listOpenWaGroups(sessionId: string) {
  return openWaBrowserRequest<OpenWaGroup[]>(`/api/openwa/sessions/${sessionId}/groups`);
}

export function createOpenWaGroup(sessionId: string, name: string, participants: string[]) {
  return openWaBrowserRequest<OpenWaGroup>(`/api/openwa/sessions/${sessionId}/groups`, {
    method: "POST",
    body: {
      name,
      participants,
    },
  });
}

export function getOpenWaGroup(sessionId: string, groupId: string) {
  return openWaBrowserRequest<OpenWaGroup>(`/api/openwa/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}`);
}

export function updateOpenWaGroupField(sessionId: string, groupId: string, action: "subject" | "description", value: string) {
  return openWaBrowserRequest<{ success: boolean; message: string }>(
    `/api/openwa/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}`,
    {
      method: "PUT",
      body: {
        action,
        value,
      },
    },
  );
}

export function runOpenWaGroupAction(
  sessionId: string,
  groupId: string,
  action: "addParticipants" | "removeParticipants" | "promoteParticipants" | "demoteParticipants" | "leave" | "revokeInviteCode",
  participants?: string[],
) {
  return openWaBrowserRequest<{ success?: boolean; message?: string; inviteCode?: string; inviteLink?: string }>(
    `/api/openwa/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}`,
    {
      method: "POST",
      body: participants
        ? {
            action,
            participants,
          }
        : {
            action,
          },
    },
  );
}

export function getOpenWaGroupInviteCode(sessionId: string, groupId: string) {
  return openWaBrowserRequest<{ inviteCode: string; inviteLink: string }>(
    `/api/openwa/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}/invite-code`,
  );
}

export function listOpenWaContacts(sessionId: string) {
  return openWaBrowserRequest<OpenWaContact[]>(`/api/openwa/sessions/${sessionId}/contacts`);
}

export function getOpenWaContact(sessionId: string, contactId: string) {
  return openWaBrowserRequest<OpenWaContact>(`/api/openwa/sessions/${sessionId}/contacts/${encodeURIComponent(contactId)}`);
}

export function checkOpenWaNumber(sessionId: string, number: string) {
  return openWaBrowserRequest<{ number: string; exists: boolean; whatsappId: string | null }>(
    `/api/openwa/sessions/${sessionId}/contacts/check/${encodeURIComponent(number)}`,
  );
}

export function runOpenWaContactAction(sessionId: string, contactId: string, action: "block" | "unblock" | "profilePicture") {
  return openWaBrowserRequest<{ success?: boolean; message?: string; url?: string | null }>(
    `/api/openwa/sessions/${sessionId}/contacts/${encodeURIComponent(contactId)}`,
    {
      method: "POST",
      body: {
        action,
      },
    },
  );
}

export function listOpenWaSessionWebhooks(sessionId: string) {
  return openWaBrowserRequest<OpenWaWebhook[]>(`/api/openwa/sessions/${sessionId}/webhooks`);
}

export function createOpenWaWebhook(
  sessionId: string,
  payload: {
    url: string;
    events: string[];
    secret?: string;
    active?: boolean;
    retryCount?: number;
    headers?: Record<string, string>;
  },
) {
  return openWaBrowserRequest<OpenWaWebhook>(`/api/openwa/sessions/${sessionId}/webhooks`, {
    method: "POST",
    body: payload,
  });
}

export function updateOpenWaWebhook(
  sessionId: string,
  webhookId: string,
  payload: Partial<{
    url: string;
    events: string[];
    secret: string;
    active: boolean;
    retryCount: number;
    headers: Record<string, string>;
  }>,
) {
  return openWaBrowserRequest<OpenWaWebhook>(`/api/openwa/sessions/${sessionId}/webhooks/${webhookId}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteOpenWaWebhook(sessionId: string, webhookId: string) {
  return openWaBrowserRequest<{ ok: true }>(`/api/openwa/sessions/${sessionId}/webhooks/${webhookId}`, {
    method: "DELETE",
  });
}

export function testOpenWaWebhook(sessionId: string, webhookId: string) {
  return openWaBrowserRequest<{ success: boolean; statusCode?: number; error?: string }>(
    `/api/openwa/sessions/${sessionId}/webhooks/${webhookId}/test`,
    {
      method: "POST",
    },
  );
}

export function listAllOpenWaWebhooks() {
  return openWaBrowserRequest<OpenWaWebhook[]>("/api/openwa/webhooks");
}

export function getOpenWaStats(options: StatsRequestOptions) {
  const params = new URLSearchParams();
  params.set("kind", options.kind);

  if (options.kind === "messages") {
    params.set("period", options.period ?? "24h");
  }

  if (options.kind === "session") {
    params.set("sessionId", options.sessionId);
  }

  return openWaBrowserRequest<OpenWaOverviewStats | OpenWaMessageStats | OpenWaSessionStats>(`/api/openwa/stats?${params.toString()}`);
}

export function getOpenWaOverviewStats() {
  return getOpenWaStats({ kind: "overview" }) as Promise<OpenWaOverviewStats>;
}

export function getOpenWaMessageStats(period: "24h" | "7d" | "30d" = "24h") {
  return getOpenWaStats({ kind: "messages", period }) as Promise<OpenWaMessageStats>;
}

export function getOpenWaSessionStats(sessionId: string) {
  return getOpenWaStats({ kind: "session", sessionId }) as Promise<OpenWaSessionStats>;
}
