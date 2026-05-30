import { createHmac } from "node:crypto";
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

type OpenWaEnvironment = {
  apiKey?: string;
  baseUrl: string;
  defaultCountryCode: string;
  sessionId?: string;
  targetPhone?: string;
  webhookSecret?: string;
};

type SendTextMessageInput = {
  phoneNumber: string;
  text: string;
};

type OpenWaRequestOptions = {
  body?: unknown;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
};

type SessionActionPayload = {
  name: string;
};

type OpenWaMessageActionPayload =
  | {
      action: "sendText";
      chatId: string;
      text: string;
    }
  | {
      action: "reply";
      chatId: string;
      quotedMessageId: string;
      text: string;
    }
  | {
      action: "react";
      chatId: string;
      messageId: string;
      emoji: string;
    }
  | {
      action: "delete";
      chatId: string;
      messageId: string;
      everyone?: boolean;
    };

type OpenWaGroupActionPayload =
  | {
      action: "addParticipants" | "removeParticipants" | "promoteParticipants" | "demoteParticipants";
      participants: string[];
    }
  | {
      action: "leave";
    }
  | {
      action: "revokeInviteCode";
    };

type OpenWaContactActionPayload =
  | {
      action: "block";
    }
  | {
      action: "unblock";
    }
  | {
      action: "profilePicture";
    };

type OpenWaWebhookPayload = {
  active?: boolean;
  events: string[];
  headers?: Record<string, string>;
  retryCount?: number;
  secret?: string;
  url: string;
};

function cleanValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getConfiguredApiKey() {
  const apiKey = readOpenWaEnvironment().apiKey;

  if (!apiKey) {
    throw new Error("Falta configurar OPENWA_API_KEY.");
  }

  return apiKey;
}

function buildQueryString(query?: OpenWaRequestOptions["query"]) {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export async function openWaRequest<T>(path: string, options: OpenWaRequestOptions = {}) {
  const environment = readOpenWaEnvironment();
  const apiKey = getConfiguredApiKey();
  const response = await fetch(`${environment.baseUrl}${path}${buildQueryString(options.query)}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  const rawText = await response.text();
  const payload = parseOpenWaResponse(rawText);

  if (!response.ok) {
    throw new Error(formatOpenWaError(response.status, payload));
  }

  return payload as T;
}

export function readOpenWaEnvironment(): OpenWaEnvironment {
  return {
    apiKey: cleanValue(process.env.OPENWA_API_KEY),
    baseUrl: (cleanValue(process.env.OPENWA_BASE_URL) ?? "http://localhost:2785/api").replace(/\/$/, ""),
    defaultCountryCode: cleanValue(process.env.OPENWA_DEFAULT_COUNTRY_CODE) ?? "57",
    sessionId: cleanValue(process.env.OPENWA_SESSION_ID),
    targetPhone: cleanValue(process.env.OPENWA_TARGET_PHONE),
    webhookSecret: cleanValue(process.env.OPENWA_WEBHOOK_SECRET),
  };
}

export function normalizePhoneNumber(input: string, defaultCountryCode = readOpenWaEnvironment().defaultCountryCode) {
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    throw new Error("Ingresa un número de WhatsApp válido.");
  }

  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }

  if (digits.length < 11) {
    throw new Error("Incluye el indicativo del país en el número de WhatsApp.");
  }

  return digits;
}

export function toOpenWaChatId(phoneNumber: string) {
  return `${normalizePhoneNumber(phoneNumber)}@c.us`;
}

export function getFallbackSessionId() {
  return readOpenWaEnvironment().sessionId;
}

function getDefaultSendSessionId() {
  const sessionId = getFallbackSessionId();

  if (!sessionId) {
    throw new Error("Falta configurar OPENWA_SESSION_ID.");
  }

  return sessionId;
}

export function getConfiguredTargetPhone() {
  const environment = readOpenWaEnvironment();

  if (!environment.targetPhone) {
    throw new Error("Falta configurar OPENWA_TARGET_PHONE.");
  }

  return environment.targetPhone;
}

function parseOpenWaResponse(rawText: string) {
  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return rawText;
  }
}

function translateOpenWaMessage(message: string) {
  if (message.includes("Session is not started")) {
    return "La sesión no está iniciada. Pulsa Iniciar antes de ver el QR.";
  }

  if (message.includes("QR code is not ready yet")) {
    return "El código QR aún no está listo. Espera unos segundos e inténtalo de nuevo.";
  }

  if (message.includes("already authenticated")) {
    return "La sesión ya está autenticada. No necesitas escanear un QR.";
  }

  if (message.includes("Invalid API key")) {
    return "La API key de OpenWA no es válida. Revisa OPENWA_API_KEY en .env.docker.";
  }

  if (message.includes("Session is already started")) {
    return "La sesión ya está iniciada.";
  }

  if (message.includes("Failed to launch the browser") || message.includes("profile appears to be in use")) {
    return "Chromium quedó bloqueado por una sesión anterior. Reinicia OpenWA o ejecuta npm run docker:openwa:clean-locks.";
  }

  if (message === "Internal server error") {
    return "OpenWA no pudo iniciar WhatsApp. Revisa los logs de hitravel-openwa y vuelve a intentar.";
  }

  return message;
}

function formatOpenWaError(status: number, payload: unknown) {
  if (payload && typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;

    if (typeof record.message === "string" && record.message.trim()) {
      return translateOpenWaMessage(record.message.trim());
    }

    if (typeof record.error === "string" && record.error.trim()) {
      return translateOpenWaMessage(record.error.trim());
    }
  }

  if (typeof payload === "string" && payload) {
    return translateOpenWaMessage(payload);
  }

  if (payload && typeof payload === "object") {
    return `OpenWA respondió ${status}: ${JSON.stringify(payload)}`;
  }

  return `OpenWA respondió ${status}.`;
}

export async function listSessions() {
  return openWaRequest<OpenWaSession[]>("/sessions");
}

export async function createSession(payload: SessionActionPayload) {
  return openWaRequest<OpenWaSession>("/sessions", {
    method: "POST",
    body: payload,
  });
}

export async function getSession(sessionId: string) {
  return openWaRequest<OpenWaSession>(`/sessions/${sessionId}`);
}

export async function deleteSession(sessionId: string) {
  await openWaRequest<void>(`/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export async function startSession(sessionId: string) {
  return openWaRequest<OpenWaSession>(`/sessions/${sessionId}/start`, {
    method: "POST",
  });
}

export async function stopSession(sessionId: string) {
  return openWaRequest<OpenWaSession>(`/sessions/${sessionId}/stop`, {
    method: "POST",
  });
}

export async function getSessionQrCode(sessionId: string) {
  return openWaRequest<OpenWaQrCode>(`/sessions/${sessionId}/qr`);
}

export async function listMessages(sessionId: string, options: { chatId?: string; limit?: number; offset?: number } = {}) {
  return openWaRequest<OpenWaMessagesResponse>(`/sessions/${sessionId}/messages`, {
    query: options,
  });
}

export async function runMessageAction(sessionId: string, payload: OpenWaMessageActionPayload) {
  switch (payload.action) {
    case "sendText":
      return openWaRequest<{ messageId: string; timestamp: number }>(`/sessions/${sessionId}/messages/send-text`, {
        method: "POST",
        body: {
          chatId: payload.chatId,
          text: payload.text,
        },
      });
    case "reply":
      return openWaRequest<{ messageId: string; timestamp: number }>(`/sessions/${sessionId}/messages/reply`, {
        method: "POST",
        body: {
          chatId: payload.chatId,
          quotedMessageId: payload.quotedMessageId,
          text: payload.text,
        },
      });
    case "react":
      return openWaRequest<{ success: boolean }>(`/sessions/${sessionId}/messages/react`, {
        method: "POST",
        body: {
          chatId: payload.chatId,
          messageId: payload.messageId,
          emoji: payload.emoji,
        },
      });
    case "delete":
      return openWaRequest<{ success: boolean }>(`/sessions/${sessionId}/messages/delete`, {
        method: "POST",
        body: {
          chatId: payload.chatId,
          messageId: payload.messageId,
          everyone: payload.everyone ?? false,
        },
      });
  }
}

export async function listGroups(sessionId: string) {
  return openWaRequest<OpenWaGroup[]>(`/sessions/${sessionId}/groups`);
}

export async function getGroup(sessionId: string, groupId: string) {
  return openWaRequest<OpenWaGroup>(`/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}`);
}

export async function createGroup(sessionId: string, payload: { name: string; participants: string[] }) {
  return openWaRequest<OpenWaGroup>(`/sessions/${sessionId}/groups`, {
    method: "POST",
    body: payload,
  });
}

export async function runGroupAction(sessionId: string, groupId: string, payload: OpenWaGroupActionPayload) {
  switch (payload.action) {
    case "addParticipants":
      return openWaRequest<{ success: boolean; message: string }>(
        `/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}/participants`,
        {
          method: "POST",
          body: {
            participants: payload.participants,
          },
        },
      );
    case "removeParticipants":
      return openWaRequest<{ success: boolean; message: string }>(
        `/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}/participants`,
        {
          method: "DELETE",
          body: {
            participants: payload.participants,
          },
        },
      );
    case "promoteParticipants":
      return openWaRequest<{ success: boolean; message: string }>(
        `/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}/participants/promote`,
        {
          method: "POST",
          body: {
            participants: payload.participants,
          },
        },
      );
    case "demoteParticipants":
      return openWaRequest<{ success: boolean; message: string }>(
        `/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}/participants/demote`,
        {
          method: "POST",
          body: {
            participants: payload.participants,
          },
        },
      );
    case "leave":
      return openWaRequest<{ success: boolean; message: string }>(`/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}/leave`, {
        method: "POST",
      });
    case "revokeInviteCode":
      return openWaRequest<{ inviteCode: string; inviteLink: string; message: string }>(
        `/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}/invite-code/revoke`,
        {
          method: "POST",
        },
      );
  }
}

export async function updateGroupSubject(sessionId: string, groupId: string, subject: string) {
  return openWaRequest<{ success: boolean; message: string }>(`/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}/subject`, {
    method: "PUT",
    body: {
      subject,
    },
  });
}

export async function updateGroupDescription(sessionId: string, groupId: string, description: string) {
  return openWaRequest<{ success: boolean; message: string }>(`/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}/description`, {
    method: "PUT",
    body: {
      description,
    },
  });
}

export async function getGroupInviteCode(sessionId: string, groupId: string) {
  return openWaRequest<{ inviteCode: string; inviteLink: string }>(`/sessions/${sessionId}/groups/${encodeURIComponent(groupId)}/invite-code`);
}

export async function listContacts(sessionId: string) {
  return openWaRequest<OpenWaContact[]>(`/sessions/${sessionId}/contacts`);
}

export async function getContact(sessionId: string, contactId: string) {
  return openWaRequest<OpenWaContact>(`/sessions/${sessionId}/contacts/${encodeURIComponent(contactId)}`);
}

export async function checkContactNumber(sessionId: string, number: string) {
  return openWaRequest<{ number: string; exists: boolean; whatsappId: string | null }>(
    `/sessions/${sessionId}/contacts/check/${encodeURIComponent(number)}`,
  );
}

export async function runContactAction(sessionId: string, contactId: string, payload: OpenWaContactActionPayload) {
  switch (payload.action) {
    case "profilePicture":
      return openWaRequest<{ url: string | null }>(
        `/sessions/${sessionId}/contacts/${encodeURIComponent(contactId)}/profile-picture`,
      );
    case "block":
      return openWaRequest<{ success: boolean; message: string }>(
        `/sessions/${sessionId}/contacts/${encodeURIComponent(contactId)}/block`,
        {
          method: "POST",
        },
      );
    case "unblock":
      return openWaRequest<{ success: boolean; message: string }>(
        `/sessions/${sessionId}/contacts/${encodeURIComponent(contactId)}/block`,
        {
          method: "DELETE",
        },
      );
  }
}

export async function listSessionWebhooks(sessionId: string) {
  return openWaRequest<OpenWaWebhook[]>(`/sessions/${sessionId}/webhooks`);
}

export async function createSessionWebhook(sessionId: string, payload: OpenWaWebhookPayload) {
  return openWaRequest<OpenWaWebhook>(`/sessions/${sessionId}/webhooks`, {
    method: "POST",
    body: payload,
  });
}

export async function getSessionWebhook(sessionId: string, webhookId: string) {
  return openWaRequest<OpenWaWebhook>(`/sessions/${sessionId}/webhooks/${webhookId}`);
}

export async function updateSessionWebhook(sessionId: string, webhookId: string, payload: Partial<OpenWaWebhookPayload>) {
  return openWaRequest<OpenWaWebhook>(`/sessions/${sessionId}/webhooks/${webhookId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteSessionWebhook(sessionId: string, webhookId: string) {
  await openWaRequest<void>(`/sessions/${sessionId}/webhooks/${webhookId}`, {
    method: "DELETE",
  });
}

export async function testSessionWebhook(sessionId: string, webhookId: string) {
  return openWaRequest<{ success: boolean; statusCode?: number; error?: string }>(
    `/sessions/${sessionId}/webhooks/${webhookId}/test`,
    {
      method: "POST",
    },
  );
}

export async function listAllWebhooks() {
  return openWaRequest<OpenWaWebhook[]>("/webhooks");
}

export async function getOverviewStats() {
  return openWaRequest<OpenWaOverviewStats>("/stats/overview");
}

export async function getMessageStats(period: "24h" | "7d" | "30d" = "24h") {
  return openWaRequest<OpenWaMessageStats>("/stats/messages", {
    query: {
      period,
    },
  });
}

export async function getSessionStats(sessionId: string) {
  return openWaRequest<OpenWaSessionStats>(`/stats/sessions/${sessionId}`);
}

export async function sendTextMessage({ phoneNumber, text }: SendTextMessageInput) {
  return runMessageAction(getDefaultSendSessionId(), {
    action: "sendText",
    chatId: toOpenWaChatId(phoneNumber),
    text,
  });
}

export function buildWebhookSignatureCandidates(rawBody: string, secret: string) {
  const digest = createHmac("sha256", secret).update(rawBody).digest();
  const hex = digest.toString("hex");
  const base64 = digest.toString("base64");

  return new Set([hex, base64, `sha256=${hex}`, `sha256=${base64}`]);
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const candidates = buildWebhookSignatureCandidates(rawBody, secret);
  return candidates.has(signature.trim());
}
