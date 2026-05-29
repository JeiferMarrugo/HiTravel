"use client";

import { useEffect, useMemo, useState } from "react";
import type { OpenWaSession } from "@/lib/admin/types";
import { listOpenWaSessions } from "@/lib/openwa-browser";
import { useOpenWaPolling } from "@/hooks/use-openwa-polling";

const STORAGE_KEY = "openwa-active-session-id";

type UseOpenWaSessionOptions = {
  fallbackSessionId?: string | null;
};

function readInitialSessionId(fallbackSessionId?: string | null) {
  if (typeof window === "undefined") {
    return fallbackSessionId ?? null;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  return storedValue ?? fallbackSessionId ?? null;
}

export function useOpenWaSession({ fallbackSessionId }: UseOpenWaSessionOptions = {}) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(() => readInitialSessionId(fallbackSessionId));
  const sessionsState = useOpenWaPolling<OpenWaSession[]>(() => listOpenWaSessions(), {
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
