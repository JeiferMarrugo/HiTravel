import { NextResponse } from "next/server";
import {
  checkContactNumber,
  createGroup,
  createSession,
  createSessionWebhook,
  deleteSession,
  deleteSessionWebhook,
  getContact,
  getGroup,
  getGroupInviteCode,
  getMessageStats,
  getOverviewStats,
  getSession,
  getSessionQrCode,
  getSessionStats,
  getSessionWebhook,
  listAllWebhooks,
  listContacts,
  listGroups,
  listMessages,
  listSessionWebhooks,
  listSessions,
  openWaRequest,
  runContactAction,
  runGroupAction,
  runMessageAction,
  startSession,
  stopSession,
  testSessionWebhook,
  updateGroupDescription,
  updateGroupSubject,
  updateSessionWebhook,
} from "@/lib/openwa";

type OpenWaProxyRouteContext = {
  params: Promise<{
    segments?: string[];
  }>;
};

type GroupUpdatePayload = {
  action: "description" | "subject";
  value: string;
};

type SessionsCacheEntry = {
  data: Awaited<ReturnType<typeof listSessions>> | null;
  expiresAt: number;
  inFlight: Promise<Awaited<ReturnType<typeof listSessions>>> | null;
};

const sessionsCache: SessionsCacheEntry = {
  data: null,
  expiresAt: 0,
  inFlight: null,
};

function buildErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "No fue posible procesar la solicitud.";

  if (message.startsWith("Falta configurar OPENWA_")) {
    return NextResponse.json({ error: message }, { status: 503 });
  }

  if (message.includes("OpenWA respondió 429")) {
    return NextResponse.json(
      { error: "OpenWA está limitando temporalmente las peticiones. Intenta de nuevo en unos segundos." },
      { status: 429 },
    );
  }

  if (
    message.includes("not found") ||
    message.includes("not ready") ||
    message.includes("not active") ||
    message.includes("Session is not started")
  ) {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ error: message }, { status: 500 });
}

async function readJsonBody<T>(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return null;
  }

  const text = await request.text();
  return text ? (JSON.parse(text) as T) : null;
}

function getQueryValue(request: Request, key: string) {
  return new URL(request.url).searchParams.get(key) ?? undefined;
}

async function getCachedSessions() {
  const now = Date.now();

  if (sessionsCache.data && sessionsCache.expiresAt > now) {
    return sessionsCache.data;
  }

  if (sessionsCache.inFlight) {
    return sessionsCache.inFlight;
  }

  const request = listSessions()
    .then((sessions) => {
      sessionsCache.data = sessions;
      sessionsCache.expiresAt = Date.now() + 3000;
      return sessions;
    })
    .catch((error) => {
      if (sessionsCache.data) {
        sessionsCache.expiresAt = Date.now() + 3000;
        return sessionsCache.data;
      }

      throw error;
    })
    .finally(() => {
      sessionsCache.inFlight = null;
    });

  sessionsCache.inFlight = request;
  return request;
}

function invalidateSessionsCache() {
  sessionsCache.data = null;
  sessionsCache.expiresAt = 0;
  sessionsCache.inFlight = null;
}

async function handleStatsRequest(request: Request, segments: string[]) {
  if (segments.length !== 1 || request.method !== "GET") {
    return NextResponse.json({ error: "Ruta de estadísticas no soportada." }, { status: 405 });
  }

  const kind = getQueryValue(request, "kind") ?? "overview";

  if (kind === "overview") {
    return NextResponse.json(await getOverviewStats());
  }

  if (kind === "messages") {
    const period = (getQueryValue(request, "period") as "24h" | "7d" | "30d" | undefined) ?? "24h";
    return NextResponse.json(await getMessageStats(period));
  }

  if (kind === "session") {
    const sessionId = getQueryValue(request, "sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Debes indicar sessionId." }, { status: 400 });
    }

    return NextResponse.json(await getSessionStats(sessionId));
  }

  return NextResponse.json({ error: "Tipo de estadística no soportado." }, { status: 400 });
}

async function handleSessionsRootRequest(request: Request) {
  if (request.method === "GET") {
    return NextResponse.json(await getCachedSessions());
  }

  if (request.method === "POST") {
    const body = await readJsonBody<{ name?: string }>(request);

    if (!body?.name?.trim()) {
      return NextResponse.json({ error: "Debes indicar el nombre de la sesión." }, { status: 400 });
    }

    const session = await createSession({ name: body.name.trim() });
    invalidateSessionsCache();
    return NextResponse.json(session);
  }

  return NextResponse.json({ error: "Método no soportado." }, { status: 405 });
}

async function handleMessagesRequest(request: Request, sessionId: string) {
  if (request.method === "GET") {
    return NextResponse.json(
      await listMessages(sessionId, {
        chatId: getQueryValue(request, "chatId"),
        limit: Number(getQueryValue(request, "limit") ?? "50"),
        offset: Number(getQueryValue(request, "offset") ?? "0"),
      }),
    );
  }

  if (request.method === "POST") {
    const body = await readJsonBody<Parameters<typeof runMessageAction>[1]>(request);

    if (!body) {
      return NextResponse.json({ error: "Debes enviar una acción de mensaje." }, { status: 400 });
    }

    return NextResponse.json(await runMessageAction(sessionId, body));
  }

  return NextResponse.json({ error: "Método no soportado." }, { status: 405 });
}

async function handleGroupsRequest(request: Request, sessionId: string, segments: string[]) {
  if (segments.length === 3) {
    if (request.method === "GET") {
      return NextResponse.json(await listGroups(sessionId));
    }

    if (request.method === "POST") {
      const body = await readJsonBody<{ name?: string; participants?: string[] }>(request);

      if (!body?.name?.trim()) {
        return NextResponse.json({ error: "Debes indicar el nombre del grupo." }, { status: 400 });
      }

      return NextResponse.json(
        await createGroup(sessionId, {
          name: body.name.trim(),
          participants: body.participants ?? [],
        }),
      );
    }
  }

  const groupId = decodeURIComponent(segments[3] ?? "");

  if (!groupId) {
    return NextResponse.json({ error: "Debes indicar el grupo." }, { status: 400 });
  }

  if (segments.length === 4) {
    if (request.method === "GET") {
      return NextResponse.json(await getGroup(sessionId, groupId));
    }

    if (request.method === "PUT") {
      const body = await readJsonBody<GroupUpdatePayload>(request);

      if (!body?.value?.trim()) {
        return NextResponse.json({ error: "Debes indicar el nuevo valor." }, { status: 400 });
      }

      if (body.action === "subject") {
        return NextResponse.json(await updateGroupSubject(sessionId, groupId, body.value.trim()));
      }

      if (body.action === "description") {
        return NextResponse.json(await updateGroupDescription(sessionId, groupId, body.value.trim()));
      }
    }

    if (request.method === "POST") {
      const body = await readJsonBody<Parameters<typeof runGroupAction>[2]>(request);

      if (!body) {
        return NextResponse.json({ error: "Debes indicar una acción para el grupo." }, { status: 400 });
      }

      return NextResponse.json(await runGroupAction(sessionId, groupId, body));
    }
  }

  if (segments.length === 5 && segments[4] === "invite-code" && request.method === "GET") {
    return NextResponse.json(await getGroupInviteCode(sessionId, groupId));
  }

  return NextResponse.json({ error: "Ruta de grupos no soportada." }, { status: 405 });
}

async function handleContactsRequest(request: Request, sessionId: string, segments: string[]) {
  if (segments.length === 3 && request.method === "GET") {
    return NextResponse.json(await listContacts(sessionId));
  }

  if (segments[3] === "check" && segments[4] && request.method === "GET") {
    return NextResponse.json(await checkContactNumber(sessionId, segments[4]));
  }

  const contactId = decodeURIComponent(segments[3] ?? "");

  if (!contactId) {
    return NextResponse.json({ error: "Debes indicar el contacto." }, { status: 400 });
  }

  if (request.method === "GET") {
    return NextResponse.json(await getContact(sessionId, contactId));
  }

  if (request.method === "POST") {
    const body = await readJsonBody<Parameters<typeof runContactAction>[2]>(request);

    if (!body) {
      return NextResponse.json({ error: "Debes indicar una acción para el contacto." }, { status: 400 });
    }

    return NextResponse.json(await runContactAction(sessionId, contactId, body));
  }

  return NextResponse.json({ error: "Ruta de contactos no soportada." }, { status: 405 });
}

async function handleWebhooksRequest(request: Request, sessionId: string, segments: string[]) {
  if (segments.length === 3) {
    if (request.method === "GET") {
      return NextResponse.json(await listSessionWebhooks(sessionId));
    }

    if (request.method === "POST") {
      const body = await readJsonBody<{
        active?: boolean;
        events?: string[];
        headers?: Record<string, string>;
        retryCount?: number;
        secret?: string;
        url?: string;
      }>(request);

      if (!body?.url?.trim()) {
        return NextResponse.json({ error: "Debes indicar la URL del webhook." }, { status: 400 });
      }

      return NextResponse.json(
        await createSessionWebhook(sessionId, {
          url: body.url.trim(),
          events: body.events ?? ["message.received"],
          secret: body.secret,
          headers: body.headers,
          active: body.active,
          retryCount: body.retryCount,
        }),
      );
    }
  }

  const webhookId = segments[3];

  if (!webhookId) {
    return NextResponse.json({ error: "Debes indicar el webhook." }, { status: 400 });
  }

  if (segments.length === 5 && segments[4] === "test" && request.method === "POST") {
    return NextResponse.json(await testSessionWebhook(sessionId, webhookId));
  }

  if (request.method === "GET") {
    return NextResponse.json(await getSessionWebhook(sessionId, webhookId));
  }

  if (request.method === "PUT") {
    const body = await readJsonBody<{
      active?: boolean;
      events?: string[];
      headers?: Record<string, string>;
      retryCount?: number;
      secret?: string;
      url?: string;
    }>(request);

    return NextResponse.json(await updateSessionWebhook(sessionId, webhookId, body ?? {}));
  }

  if (request.method === "DELETE") {
    await deleteSessionWebhook(sessionId, webhookId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ruta de webhooks no soportada." }, { status: 405 });
}

async function handleSessionRequest(request: Request, segments: string[]) {
  const sessionId = segments[1];

  if (!sessionId) {
    return NextResponse.json({ error: "Debes indicar la sesión." }, { status: 400 });
  }

  if (segments.length === 2) {
    if (request.method === "GET") {
      return NextResponse.json(await getSession(sessionId));
    }

    if (request.method === "DELETE") {
      await deleteSession(sessionId);
      invalidateSessionsCache();
      return NextResponse.json({ ok: true });
    }
  }

  if (segments[2] === "start" && request.method === "POST") {
    const session = await startSession(sessionId);
    invalidateSessionsCache();
    return NextResponse.json(session);
  }

  if (segments[2] === "stop" && request.method === "POST") {
    const session = await stopSession(sessionId);
    invalidateSessionsCache();
    return NextResponse.json(session);
  }

  if (segments[2] === "qr" && request.method === "GET") {
    return NextResponse.json(await getSessionQrCode(sessionId));
  }

  if (segments[2] === "messages") {
    return handleMessagesRequest(request, sessionId);
  }

  if (segments[2] === "groups") {
    return handleGroupsRequest(request, sessionId, segments);
  }

  if (segments[2] === "contacts") {
    return handleContactsRequest(request, sessionId, segments);
  }

  if (segments[2] === "webhooks") {
    return handleWebhooksRequest(request, sessionId, segments);
  }

  return NextResponse.json({ error: "Ruta de sesión no soportada." }, { status: 405 });
}

async function handleRequest(request: Request, context: OpenWaProxyRouteContext) {
  try {
    const { segments = [] } = await context.params;

    if (segments.length === 0) {
      return NextResponse.json({ error: "Ruta OpenWA inválida." }, { status: 404 });
    }

    if (segments[0] === "sessions") {
      if (segments[1] === "stats" && segments[2] === "overview" && request.method === "GET") {
        return NextResponse.json(
          await openWaRequest<{
            total: number;
            active: number;
            ready: number;
            disconnected: number;
            byStatus: Record<string, number>;
            memoryUsage: { heapUsed: number; heapTotal: number; rss: number };
          }>("/sessions/stats/overview"),
        );
      }

      if (segments.length === 1) {
        return handleSessionsRootRequest(request);
      }

      return handleSessionRequest(request, segments);
    }

    if (segments[0] === "webhooks" && request.method === "GET") {
      return NextResponse.json(await listAllWebhooks());
    }

    if (segments[0] === "stats") {
      return handleStatsRequest(request, segments);
    }

    return NextResponse.json({ error: "Ruta OpenWA no soportada." }, { status: 404 });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function GET(request: Request, context: OpenWaProxyRouteContext) {
  return handleRequest(request, context);
}

export async function POST(request: Request, context: OpenWaProxyRouteContext) {
  return handleRequest(request, context);
}

export async function PUT(request: Request, context: OpenWaProxyRouteContext) {
  return handleRequest(request, context);
}

export async function DELETE(request: Request, context: OpenWaProxyRouteContext) {
  return handleRequest(request, context);
}
