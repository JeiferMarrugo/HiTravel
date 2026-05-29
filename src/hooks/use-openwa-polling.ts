"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseOpenWaPollingOptions<TData> = {
  enabled?: boolean;
  initialData?: TData;
  intervalMs?: number;
};

export function useOpenWaPolling<TData>(
  fetcher: () => Promise<TData>,
  options: UseOpenWaPollingOptions<TData> = {},
) {
  const { enabled = true, initialData, intervalMs = 5000 } = options;
  const [data, setData] = useState<TData | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(enabled && initialData === undefined);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<TData | undefined>(initialData);
  const fetcherRef = useRef(fetcher);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const refetch = useCallback(async () => {
    if (!enabled || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setError(null);
    setIsLoading(dataRef.current === undefined);

    try {
      const nextData = await fetcherRef.current();
      dataRef.current = nextData;
      setData(nextData);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "No fue posible actualizar los datos.");
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void refetch();
    }, 0);

    const intervalId = window.setInterval(() => {
      void refetch();
    }, intervalMs);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs, refetch]);

  return {
    data,
    error,
    isLoading,
    refetch,
    setData,
  };
}
