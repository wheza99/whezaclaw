"use client";

import { useConnection } from "./connection-context";
import { useCallback } from "react";

export interface Session {
  key: string;
  kind: string;
  channel: string;
  label?: string;
  displayName: string;
  updatedAt: number;
  sessionId: string;
  model: string;
  contextTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  status: string;
  startedAt?: number;
  endedAt?: number;
  runtimeMs?: number;
  lastChannel?: string;
}

export function useGateway() {
  const { config, isConnected } = useConnection();

  const invoke = useCallback(
    async (tool: string, args: Record<string, unknown> = {}) => {
      if (!isConnected) throw new Error("Not connected");

      const res = await fetch("/api/gateway", {
        method: "POST",
        headers: {
          "x-gateway-url": config.url,
          "x-gateway-token": config.token,
          "x-gateway-auth-mode": config.authMode,
          "x-gateway-path": "/tools/invoke",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tool, args }),
      });

      if (!res.ok) throw new Error(`Gateway error: ${res.status}`);
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error?.message || "Tool invoke failed");

      // Parse nested text content
      const content = data.result?.content?.[0]?.text;
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          return content;
        }
      }
      return data.result;
    },
    [config, isConnected]
  );

  const fetchSessions = useCallback(async (): Promise<Session[]> => {
    const data = await invoke("sessions_list", { args: {} });
    return data?.sessions || [];
  }, [invoke]);

  const fetchHistory = useCallback(
    async (sessionKey: string, limit = 50) => {
      const data = await invoke("sessions_history", { sessionKey, limit });
      return data;
    },
    [invoke]
  );

  return { invoke, fetchSessions, fetchHistory, isConnected };
}
