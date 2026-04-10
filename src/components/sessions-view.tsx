"use client";

import { useEffect, useState } from "react";
import { useGateway, Session } from "@/lib/use-gateway";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  MessageSquare,
  Clock,
  Zap,
  Loader2,
  RefreshCw,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatCost(usd: number): string {
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

function extractAgentName(key: string): string {
  // agent:main:discord:... → main, agent:citra:citra → citra
  const parts = key.split(":");
  if (parts[0] === "agent" && parts.length >= 2) return parts[1];
  return key;
}

function groupByAgent(sessions: Session[]): Record<string, Session[]> {
  const groups: Record<string, Session[]> = {};
  for (const s of sessions) {
    const agent = extractAgentName(s.key);
    if (!groups[agent]) groups[agent] = [];
    groups[agent].push(s);
  }
  return groups;
}

const agentColors: Record<string, string> = {
  main: "from-purple-500 to-blue-500",
  citra: "from-pink-500 to-rose-500",
  flora: "from-green-500 to-emerald-500",
  starla: "from-yellow-500 to-amber-500",
  nadia: "from-cyan-500 to-teal-500",
  dira: "from-indigo-500 to-violet-500",
  maya: "from-orange-500 to-red-500",
  luna: "from-slate-400 to-zinc-500",
  sinta: "from-fuchsia-500 to-pink-500",
  devi: "from-lime-500 to-green-500",
};

const agentLabels: Record<string, string> = {
  main: "Alya",
  citra: "Citra",
  flora: "Flora",
  starla: "Starla",
  nadia: "Nadia",
  dira: "Dira",
  maya: "Maya",
  luna: "Luna",
  sinta: "Sinta",
  devi: "Devi",
};

export default function SessionsView() {
  const { fetchSessions, isConnected } = useGateway();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) load();
  }, [isConnected]);

  if (!isConnected) return null;

  const grouped = groupByAgent(sessions);
  const agentNames = Object.keys(grouped).sort((a, b) => {
    // main first
    if (a === "main") return -1;
    if (b === "main") return 1;
    return a.localeCompare(b);
  });

  const totalCost = sessions.reduce((sum, s) => sum + s.estimatedCostUsd, 0);
  const activeCount = sessions.filter((s) => s.status === "running").length;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bot className="w-4 h-4" />
            <span>{agentNames.length} agents</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span>{sessions.length} sessions</span>
          </div>
          {activeCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>{activeCount} active</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span>{formatCost(totalCost)} total</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={load}
          disabled={loading}
          className="text-muted-foreground"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading && sessions.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Agent groups */}
      {agentNames.map((agent) => {
        const agentSessions = grouped[agent];
        const gradient = agentColors[agent] || "from-gray-500 to-gray-600";
        const label = agentLabels[agent] || agent;
        const agentCost = agentSessions.reduce((s, x) => s + x.estimatedCostUsd, 0);

        return (
          <Card key={agent} className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                  >
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{label}</CardTitle>
                    <p className="text-xs text-muted-foreground">{agent}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCost(agentCost)}</p>
                  <p className="text-xs text-muted-foreground">
                    {agentSessions.length} session{agentSessions.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {agentSessions.map((session, i) => (
                  <div key={session.sessionId}>
                    {i > 0 && <Separator className="mb-2 bg-border/30" />}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge
                          variant={session.status === "running" ? "default" : "secondary"}
                          className={`text-[10px] shrink-0 ${
                            session.status === "running"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {session.status}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-sm truncate">
                            {session.label || session.displayName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{session.model}</span>
                            <span>·</span>
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeTime(session.updatedAt)}</span>
                            {session.runtimeMs && (
                              <>
                                <span>·</span>
                                <span>{(session.runtimeMs / 1000).toFixed(1)}s</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-medium">
                          {formatCost(session.estimatedCostUsd)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((session.totalTokens / session.contextTokens) * 100).toFixed(0)}%
                          ctx
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
