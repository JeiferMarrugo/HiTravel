"use client";

import { useEffect, useMemo, useState } from "react";
import type { OpenWaSession } from "@/lib/admin/types";
import { listOpenWaSessions } from "@/lib/openwa-browser";
import { useOpenWaPolling } from "@/hooks/use-openwa-polling";

const STORAGE_KEY = "openwa-active-session-id";

type UseOpenWaSessionOptions = {
  fallbackSessionId?: string | null;
  initialSessions?: OpenWaSession[];
};

function readInitialSessionId(fallbackSessionId?: string | null, initialSessions: OpenWaSession[] = []) {
  const configuredSessionId =
    initialSessions.find((session) => session.id === fallbackSessionId)?.id ??
    initialSessions.find((session) => session.status === "ready")?.id ??
    initialSessions[0]?.id ??
    fallbackSessionId ??
    null;

  if (typeof window === "undefined") {
    return configuredSessionId;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (storedValue && initialSessions.some((session) => session.id === storedValue)) {
    return storedValue;
  }

  return storedValue ?? configuredSessionId;
}

export function useOpenWaSession({ fallbackSessionId, initialSessions = [] }: UseOpenWaSessionOptions = {}) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(() =>
    readInitialSessionId(fallbackSessionId, initialSessions),
  );
  const sessionsState = useOpenWaPolling<OpenWaSession[]>(() => listOpenWaSessions(), {
    initialData: initialSessions,
    intervalMs: 15000,
  });

  useEffect(() => {
    if (!selectedSessionId) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, selectedSessionId);
  }, [selectedSessionId]);

  const resolvedSessionId = useMemo(() => {
    const sessions = sessionsState.data ?? [];

    if (!sessions.length) {
      return selectedSessionId;
    }

    if (selectedSessionId && sessions.some((session) => session.id === selectedSessionId)) {
      return selectedSessionId;
    }

    return sessions.find((session) => session.status === "ready")?.id ?? sessions[0]?.id ?? null;
  }, [selectedSessionId, sessionsState.data]);

  const selectedSession = useMemo(
    () => (sessionsState.data ?? []).find((session) => session.id === resolvedSessionId) ?? null,
    [resolvedSessionId, sessionsState.data],
  );

  return {
    error: sessionsState.error,
    isLoading: sessionsState.isLoading,
    refreshSessions: sessionsState.refetch,
    selectedSession,
    selectedSessionId: resolvedSessionId,
    sessions: sessionsState.data ?? [],
    setSelectedSessionId,
    setSessions: sessionsState.setData,
  };
}
