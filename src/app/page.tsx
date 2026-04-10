"use client";

import { useConnection } from "@/lib/connection-context";
import ConnectionCard from "@/components/connection-card";
import { Button } from "@/components/ui/button";
import { Zap, LogOut } from "lucide-react";

export default function Home() {
  const { isConnected, disconnect, config } = useConnection();

  if (!isConnected) return <ConnectionCard />;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            WhezaClaw
          </span>
          <span className="text-xs text-emerald-400 ml-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnect}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Disconnect
        </Button>
      </header>

      {/* Main content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-57px)]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-purple-500/25">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Connected!</h1>
          <p className="text-muted-foreground">
            Gateway: <code className="text-purple-400">{config.url}</code>
          </p>
        </div>
      </main>
    </div>
  );
}
