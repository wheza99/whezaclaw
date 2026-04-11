"use client";

import { useEffect, useState, useCallback } from "react";
import { useConnection } from "@/lib/connection-context";
import { useGateway, Session } from "@/lib/use-gateway";
import ConnectionCard from "@/components/connection-card";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatView from "@/components/chat-view";

interface NavState {
  activeNav: string;
  activeSession: string | null;
}

function DashboardContent() {
  const { isConnected, disconnect, config } = useConnection();
  const { fetchSessions, invoke } = useGateway();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [navState, setNavState] = useState<NavState>({
    activeNav: "sessions",
    activeSession: null,
  });

  const loadSessions = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isConnected, fetchSessions]);

  useEffect(() => {
    if (isConnected) loadSessions();
  }, [isConnected, loadSessions]);

  if (!isConnected) return <ConnectionCard />;

  const activeSession = sessions.find((s) => s.key === navState.activeSession);
  const totalCost = sessions.reduce((s, x) => s + x.estimatedCostUsd, 0);

  return (
    <SidebarProvider>
      <AppSidebar
        navState={navState}
        onNavChange={setNavState}
        sessions={sessions}
      />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-medium truncate">
              {navState.activeSession
                ? activeSession?.label || activeSession?.displayName || "Session"
                : navState.activeNav === "sessions"
                ? "All Sessions"
                : navState.activeNav === "agents"
                ? "Agents"
                : navState.activeNav === "dashboard"
                ? "Dashboard"
                : "Settings"}
            </span>
            {activeSession && (
              <Badge
                variant={activeSession.status === "running" ? "default" : "secondary"}
                className={`text-[10px] ${
                  activeSession.status === "running"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : ""
                }`}
              >
                {activeSession.status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {sessions.length} sessions · ${totalCost.toFixed(2)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={loadSessions}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </header>

        {/* Main area */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {navState.activeSession && activeSession ? (
            <ChatView
              sessionKey={activeSession.key}
              sessionLabel={activeSession.label || activeSession.displayName}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h2 className="text-xl font-bold">WhezaClaw</h2>
                <p className="text-sm text-muted-foreground">
                  Select a session from the sidebar to view chat history
                </p>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Home() {
  return (
    <TooltipProvider>
      <DashboardContent />
    </TooltipProvider>
  );
}
