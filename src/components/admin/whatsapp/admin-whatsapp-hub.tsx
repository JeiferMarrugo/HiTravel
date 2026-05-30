"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatList } from "@/components/admin/whatsapp/chat-list";
import { ChatThread } from "@/components/admin/whatsapp/chat-thread";
import { ContactsPanel } from "@/components/admin/whatsapp/contacts-panel";
import { GroupsPanel } from "@/components/admin/whatsapp/groups-panel";
import { MessageComposer } from "@/components/admin/whatsapp/message-composer";
import { SessionsPanel } from "@/components/admin/whatsapp/sessions-panel";
import { StatsPanel } from "@/components/admin/whatsapp/stats-panel";
import { WebhooksPanel } from "@/components/admin/whatsapp/webhooks-panel";
import { useOpenWaPolling } from "@/hooks/use-openwa-polling";
import { useOpenWaSession } from "@/hooks/use-openwa-session";
import type {
  OpenWaChat,
  OpenWaContact,
  OpenWaGroup,
  OpenWaMessage,
  OpenWaMessageStats,
  OpenWaOverviewStats,
  OpenWaSessionStats,
} from "@/lib/admin/types";
import { syncActiveSessionToServer } from "@/lib/whatsapp/sync-active-session-client";
import {
  checkOpenWaNumber,
  createOpenWaGroup,
  createOpenWaSession,
  createOpenWaWebhook,
  deleteOpenWaMessage,
  deleteOpenWaSession,
  deleteOpenWaWebhook,
  getOpenWaContact,
  getOpenWaGroup,
  getOpenWaGroupInviteCode,
  getOpenWaMessageStats,
  getOpenWaOverviewStats,
  getOpenWaQrCode,
  getOpenWaSessionStats,
  listAllOpenWaWebhooks,
  listOpenWaContacts,
  listOpenWaGroups,
  listOpenWaMessages,
  listOpenWaSessionWebhooks,
  reactOpenWaMessage,
  replyOpenWaMessage,
  runOpenWaContactAction,
  runOpenWaGroupAction,
  sendOpenWaText,
  startOpenWaSession,
  stopOpenWaSession,
  testOpenWaWebhook,
  updateOpenWaGroupField,
  updateOpenWaWebhook,
} from "@/lib/openwa-browser";

type AdminWhatsAppHubProps = {
  fallbackSessionId?: string | null;
};

type HubTab = "inbox" | "sessions" | "groups" | "contacts" | "webhooks" | "stats";

const tabs: Array<{ id: HubTab; label: string; icon: string }> = [
  { id: "inbox", label: "Inbox", icon: "forum" },
  { id: "sessions", label: "Sesiones", icon: "qr_code_2" },
  { id: "groups", label: "Grupos", icon: "group" },
  { id: "contacts", label: "Contactos", icon: "contacts" },
  { id: "webhooks", label: "Webhooks", icon: "webhook" },
  { id: "stats", label: "Estadísticas", icon: "query_stats" },
];

function formatFallbackChatName(chatId: string) {
  return chatId.replace(/@c\.us|@g\.us/g, "");
}

function getChatName(chatId: string, contacts: OpenWaContact[], groups: OpenWaGroup[]) {
  if (chatId.endsWith("@g.us")) {
    return groups.find((group) => group.id === chatId)?.name ?? groups.find((group) => group.id === chatId)?.subject ?? formatFallbackChatName(chatId);
  }

  const matchingContact = contacts.find((contact) => contact.id === chatId);
  return matchingContact?.pushname ?? matchingContact?.name ?? matchingContact?.number ?? formatFallbackChatName(chatId);
}

function buildChats(messages: OpenWaMessage[], contacts: OpenWaContact[], groups: OpenWaGroup[]): OpenWaChat[] {
  const chatMap = new Map<string, OpenWaChat>();

  for (const message of messages) {
    const current = chatMap.get(message.chatId);
    const timestamp = message.timestamp ?? Math.floor(new Date(message.createdAt).getTime() / 1000);

    if (!current || (current.lastTimestamp ?? 0) < timestamp) {
      chatMap.set(message.chatId, {
        id: message.chatId,
        kind: message.chatId.endsWith("@g.us") ? "group" : message.chatId.endsWith("@c.us") ? "contact" : "unknown",
        lastMessage: message.body ?? undefined,
        lastTimestamp: timestamp,
        messageCount: current ? current.messageCount + 1 : 1,
        name: getChatName(message.chatId, contacts, groups),
      });
      continue;
    }

    chatMap.set(message.chatId, {
      ...current,
      messageCount: current.messageCount + 1,
    });
  }

  return Array.from(chatMap.values()).sort((firstChat, secondChat) => (secondChat.lastTimestamp ?? 0) - (firstChat.lastTimestamp ?? 0));
}

export function AdminWhatsAppHub({ fallbackSessionId }: AdminWhatsAppHubProps) {
  const [activeTab, setActiveTab] = useState<HubTab>("inbox");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<OpenWaMessage | null>(null);

  const { isLoading: sessionsLoading, refreshSessions, selectedSession, selectedSessionId, sessions, setSelectedSessionId } = useOpenWaSession({
    fallbackSessionId,
  });

  useEffect(() => {
    if (!selectedSessionId || selectedSession?.status !== "ready") {
      return;
    }

    void syncActiveSessionToServer(selectedSessionId).catch(() => {
      // El hub sigue funcionando aunque falle la sincronización con la BD.
    });
  }, [selectedSessionId, selectedSession?.status]);

  const loadInboxChats = useCallback(async () => {
    if (!selectedSessionId) {
      return { messages: [], total: 0 };
    }

    return listOpenWaMessages(selectedSessionId, undefined, 250);
  }, [selectedSessionId]);

  const loadGroups = useCallback(async () => {
    if (!selectedSessionId) {
      return [];
    }

    return listOpenWaGroups(selectedSessionId);
  }, [selectedSessionId]);

  const loadContacts = useCallback(async () => {
    if (!selectedSessionId) {
      return [];
    }

    return listOpenWaContacts(selectedSessionId);
  }, [selectedSessionId]);

  const loadSessionWebhooks = useCallback(async () => {
    if (!selectedSessionId) {
      return [];
    }

    return listOpenWaSessionWebhooks(selectedSessionId);
  }, [selectedSessionId]);

  const chatsState = useOpenWaPolling(loadInboxChats, {
    enabled: Boolean(selectedSessionId) && activeTab === "inbox",
    initialData: { messages: [], total: 0 },
    intervalMs: 7000,
  });
  const inferredChatId = useMemo(() => chatsState.data?.messages[0]?.chatId ?? null, [chatsState.data?.messages]);
  const loadThreadMessages = useCallback(async () => {
    const chatId = selectedChatId ?? inferredChatId;

    if (!selectedSessionId || !chatId) {
      return { messages: [], total: 0 };
    }

    return listOpenWaMessages(selectedSessionId, chatId, 200);
  }, [inferredChatId, selectedChatId, selectedSessionId]);
  const threadState = useOpenWaPolling(loadThreadMessages, {
    enabled: Boolean(selectedSessionId) && Boolean(selectedChatId ?? inferredChatId) && activeTab === "inbox",
    initialData: { messages: [], total: 0 },
    intervalMs: 5000,
  });
  const groupsState = useOpenWaPolling(loadGroups, {
    enabled: Boolean(selectedSessionId) && activeTab === "groups",
    initialData: [],
    intervalMs: 15000,
  });
  const contactsState = useOpenWaPolling(loadContacts, {
    enabled: Boolean(selectedSessionId) && activeTab === "contacts",
    initialData: [],
    intervalMs: 20000,
  });
  const sessionWebhooksState = useOpenWaPolling(loadSessionWebhooks, {
    enabled: Boolean(selectedSessionId) && activeTab === "webhooks",
    initialData: [],
    intervalMs: 12000,
  });
  const globalWebhooksState = useOpenWaPolling(() => listAllOpenWaWebhooks(), {
    enabled: activeTab === "webhooks",
    initialData: [],
    intervalMs: 15000,
  });
  const overviewStatsState = useOpenWaPolling<OpenWaOverviewStats | null>(() => getOpenWaOverviewStats(), {
    enabled: activeTab === "stats",
    intervalMs: 10000,
  });
  const messageStatsState = useOpenWaPolling<OpenWaMessageStats | null>(() => getOpenWaMessageStats("24h"), {
    enabled: activeTab === "stats",
    intervalMs: 12000,
  });
  const sessionStatsState = useOpenWaPolling<OpenWaSessionStats | null>(
    () => (selectedSessionId ? getOpenWaSessionStats(selectedSessionId) : Promise.resolve(null)),
    {
      enabled: activeTab === "stats" && Boolean(selectedSessionId),
      intervalMs: 10000,
    },
  );

  const chats = useMemo(
    () => buildChats(chatsState.data?.messages ?? [], contactsState.data ?? [], groupsState.data ?? []),
    [chatsState.data?.messages, contactsState.data, groupsState.data],
  );

  const currentChatId = useMemo(() => {
    if (selectedChatId && chats.some((chat) => chat.id === selectedChatId)) {
      return selectedChatId;
    }

    if (inferredChatId && chats.some((chat) => chat.id === inferredChatId)) {
      return inferredChatId;
    }

    return chats[0]?.id ?? null;
  }, [chats, inferredChatId, selectedChatId]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === currentChatId) ?? null,
    [chats, currentChatId],
  );

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setSelectedSessionId(sessionId);
      setSelectedChatId(null);
      setReplyingToMessage(null);
    },
    [setSelectedSessionId],
  );

  async function refreshInbox() {
    await Promise.all([chatsState.refetch(), threadState.refetch()]);
  }

  async function handleSendMessage(text: string) {
    if (!selectedSessionId || !currentChatId) {
      return;
    }

    if (replyingToMessage?.waMessageId) {
      await replyOpenWaMessage(selectedSessionId, currentChatId, replyingToMessage.waMessageId, text);
      setReplyingToMessage(null);
    } else {
      await sendOpenWaText(selectedSessionId, currentChatId, text);
    }

    await refreshInbox();
  }

  async function handleReactMessage(message: OpenWaMessage, emoji: string) {
    if (!selectedSessionId) {
      return;
    }

    const messageId = message.waMessageId ?? message.id;
    await reactOpenWaMessage(selectedSessionId, message.chatId, messageId, emoji);
    await threadState.refetch();
  }

  async function handleDeleteMessage(message: OpenWaMessage) {
    if (!selectedSessionId) {
      return;
    }

    const messageId = message.waMessageId ?? message.id;
    await deleteOpenWaMessage(selectedSessionId, message.chatId, messageId);
    await refreshInbox();
  }

  async function handleSelectGroup(groupId: string) {
    if (!selectedSessionId) {
      return;
    }

    const detailedGroup = await getOpenWaGroup(selectedSessionId, groupId);
    groupsState.setData((currentGroups) =>
      (currentGroups ?? []).map((group) => (group.id === groupId ? { ...group, ...detailedGroup } : group)),
    );
  }

  async function handleCreateSession(name: string) {
    await createOpenWaSession(name);
    await refreshSessions();
  }

  async function handleStartSession(sessionId: string) {
    await startOpenWaSession(sessionId);
    await refreshSessions();
  }

  async function handleStopSession(sessionId: string) {
    await stopOpenWaSession(sessionId);
    await refreshSessions();
  }

  async function handleDeleteSession(sessionId: string) {
    await deleteOpenWaSession(sessionId);
    await refreshSessions();
  }

  async function handleLoadQrCode(sessionId: string) {
    return getOpenWaQrCode(sessionId);
  }

  async function handleCreateGroup(name: string, participants: string[]) {
    if (!selectedSessionId) {
      return;
    }

    await createOpenWaGroup(selectedSessionId, name, participants);
    await groupsState.refetch();
  }

  async function handleGroupAction(
    groupId: string,
    action: "addParticipants" | "removeParticipants" | "promoteParticipants" | "demoteParticipants" | "leave" | "revokeInviteCode",
    participants?: string[],
  ) {
    if (!selectedSessionId) {
      return;
    }

    await runOpenWaGroupAction(selectedSessionId, groupId, action, participants);
    await groupsState.refetch();
  }

  async function handleUpdateGroupField(groupId: string, action: "subject" | "description", value: string) {
    if (!selectedSessionId) {
      return;
    }

    await updateOpenWaGroupField(selectedSessionId, groupId, action, value);
    await groupsState.refetch();
  }

  async function handleGetInviteCode(groupId: string) {
    if (!selectedSessionId) {
      throw new Error("Selecciona una sesión primero.");
    }

    return getOpenWaGroupInviteCode(selectedSessionId, groupId);
  }

  async function handleCheckNumber(number: string) {
    if (!selectedSessionId) {
      throw new Error("Selecciona una sesión primero.");
    }

    return checkOpenWaNumber(selectedSessionId, number);
  }

  async function handleLoadProfilePicture(contactId: string) {
    if (!selectedSessionId) {
      throw new Error("Selecciona una sesión primero.");
    }

    const result = await runOpenWaContactAction(selectedSessionId, contactId, "profilePicture");
    return result.url;
  }

  async function handleToggleContact(contactId: string, action: "block" | "unblock") {
    if (!selectedSessionId) {
      throw new Error("Selecciona una sesión primero.");
    }

    await runOpenWaContactAction(selectedSessionId, contactId, action);
    await contactsState.refetch();
    const detailedContact = await getOpenWaContact(selectedSessionId, contactId).catch(() => null);

    if (detailedContact) {
      contactsState.setData((currentContacts) =>
        (currentContacts ?? []).map((contact) => (contact.id === contactId ? { ...contact, ...detailedContact } : contact)),
      );
    }
  }

  async function handleCreateWebhook(payload: {
    active: boolean;
    events: string[];
    headers: Record<string, string>;
    retryCount: number;
    secret?: string;
    url: string;
  }) {
    if (!selectedSessionId) {
      throw new Error("Selecciona una sesión primero.");
    }

    await createOpenWaWebhook(selectedSessionId, payload);
    await Promise.all([sessionWebhooksState.refetch(), globalWebhooksState.refetch()]);
  }

  async function handleUpdateWebhook(webhookId: string, payload: Partial<{ active: boolean; url: string; events: string[]; retryCount: number; secret: string; headers: Record<string, string> }>) {
    if (!selectedSessionId) {
      throw new Error("Selecciona una sesión primero.");
    }

    await updateOpenWaWebhook(selectedSessionId, webhookId, payload);
    await Promise.all([sessionWebhooksState.refetch(), globalWebhooksState.refetch()]);
  }

  async function handleDeleteWebhook(webhookId: string) {
    if (!selectedSessionId) {
      throw new Error("Selecciona una sesión primero.");
    }

    await deleteOpenWaWebhook(selectedSessionId, webhookId);
    await Promise.all([sessionWebhooksState.refetch(), globalWebhooksState.refetch()]);
  }

  async function handleTestWebhook(webhookId: string) {
    if (!selectedSessionId) {
      throw new Error("Selecciona una sesión primero.");
    }

    await testOpenWaWebhook(selectedSessionId, webhookId);
  }

  return (
    <div className="w-full space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">WhatsApp Hub</h1>
          <p className="mt-2 text-lg text-on-surface-variant">
            Centro operativo de OpenWA con inbox, sesiones, grupos, contactos, webhooks y estadísticas.
          </p>
        </div>

        <div className="rounded-[1.75rem] bg-white px-5 py-4 coastal-shadow">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">Sesión activa</p>
          <p className="mt-1 font-semibold text-primary">{selectedSession?.name ?? "Sin sesión seleccionada"}</p>
          <p className="mt-1 text-sm text-on-surface-variant">{selectedSession?.status ?? "Selecciona o crea una sesión"}</p>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.id ? "bg-primary text-white" : "bg-white text-primary coastal-shadow"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </section>

      {activeTab === "sessions" ? (
        <SessionsPanel
          isLoading={sessionsLoading}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onLoadQrCode={handleLoadQrCode}
          onSelectSession={handleSelectSession}
          onStartSession={handleStartSession}
          onStopSession={handleStopSession}
          selectedSessionId={selectedSessionId}
          sessions={sessions}
        />
      ) : null}

      {activeTab === "inbox" ? (
        <section className="grid gap-6 xl:grid-cols-[0.32fr_0.68fr]">
          <ChatList activeChatId={currentChatId} chats={chats} onSelectChat={setSelectedChatId} />
          <div className="space-y-6">
            <ChatThread
              activeChatId={currentChatId}
              activeChatName={activeChat?.name}
              messages={threadState.data?.messages ?? []}
              onDeleteMessage={(message) => void handleDeleteMessage(message)}
              onReactMessage={(message, emoji) => void handleReactMessage(message, emoji)}
              onReplyMessage={(message) => setReplyingToMessage(message)}
            />
            <MessageComposer
              chatId={currentChatId}
              chatName={activeChat?.name}
              disabled={!selectedSessionId || selectedSession?.status !== "ready"}
              onCancelReply={() => setReplyingToMessage(null)}
              onSend={handleSendMessage}
              replyingToMessage={replyingToMessage?.body ?? null}
            />
          </div>
        </section>
      ) : null}

      {activeTab === "groups" ? (
        <GroupsPanel
          groups={groupsState.data ?? []}
          isLoading={groupsState.isLoading}
          onCreateGroup={handleCreateGroup}
          onGetInviteCode={handleGetInviteCode}
          onRunAction={handleGroupAction}
          onSelectGroup={handleSelectGroup}
          onUpdateField={handleUpdateGroupField}
        />
      ) : null}

      {activeTab === "contacts" ? (
        <ContactsPanel
          contacts={contactsState.data ?? []}
          isLoading={contactsState.isLoading}
          onCheckNumber={handleCheckNumber}
          onLoadProfilePicture={handleLoadProfilePicture}
          onToggleBlock={handleToggleContact}
          selectedSessionId={selectedSessionId}
        />
      ) : null}

      {activeTab === "webhooks" ? (
        <WebhooksPanel
          globalWebhooks={globalWebhooksState.data ?? []}
          isLoading={sessionWebhooksState.isLoading}
          onCreateWebhook={handleCreateWebhook}
          onDeleteWebhook={handleDeleteWebhook}
          onTestWebhook={handleTestWebhook}
          onUpdateWebhook={handleUpdateWebhook}
          sessionWebhooks={sessionWebhooksState.data ?? []}
        />
      ) : null}

      {activeTab === "stats" ? (
        <StatsPanel
          messageStats={messageStatsState.data ?? null}
          overviewStats={overviewStatsState.data ?? null}
          sessionStats={sessionStatsState.data ?? null}
        />
      ) : null}
    </div>
  );
}
