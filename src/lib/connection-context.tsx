"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface ConnectionConfig {
  url: string;
  token: string;
  authMode: "token" | "password";
}

interface ConnectionState {
  config: ConnectionConfig;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (config: ConnectionConfig) => Promise<boolean>;
  disconnect: () => void;
}

const STORAGE_KEY = "whezaclaw-connection";

const defaultConfig: ConnectionConfig = {
  url: "http://127.0.0.1:18789",
  token: "",
  authMode: "token",
};

const ConnectionContext = createContext<ConnectionState | null>(null);

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error("useConnection must be inside ConnectionProvider");
  return ctx;
}

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ConnectionConfig>(defaultConfig);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        // auto-test saved connection
        gatewayFetch(parsed, "/v1/models").then((res) => {
          if (res.ok) setIsConnected(true);
        }).catch(() => {});
      } catch {}
    }
  }, []);

  const saveConfig = (c: ConnectionConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setConfig(c);
  };

  const gatewayFetch = async (c: ConnectionConfig, path: string, init?: RequestInit) => {
    return fetch("/api/gateway", {
      ...init,
      headers: {
        "x-gateway-url": c.url,
        "x-gateway-token": c.token,
        "x-gateway-auth-mode": c.authMode,
        "x-gateway-path": path,
        ...(init?.headers || {}),
      },
    });
  };

  const connect = useCallback(async (newConfig: ConnectionConfig): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);
    saveConfig(newConfig);

    try {
      const res = await gatewayFetch(newConfig, "/v1/models");

      if (res.ok) {
        setIsConnected(true);
        return true;
      } else if (res.status === 401) {
        setError("Unauthorized — token/password salah");
      } else {
        setError(`Connection failed: ${res.status} ${res.statusText}`);
      }
    } catch (e: any) {
      setError(`Tidak bisa connect ke gateway — ${e.message}`);
    } finally {
      setIsConnecting(false);
    }
    setIsConnected(false);
    return false;
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    setConfig(defaultConfig);
  }, []);

  return (
    <ConnectionContext.Provider value={{ config, isConnected, isConnecting, error, connect, disconnect }}>
      {children}
    </ConnectionContext.Provider>
  );
}
