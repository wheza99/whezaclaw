"use client";

import { useState } from "react";
import { useConnection } from "@/lib/connection-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Loader2, Wifi, WifiOff, Zap } from "lucide-react";

export default function ConnectionCard() {
  const { connect, isConnecting, error, config } = useConnection();
  const [url, setUrl] = useState(config.url);
  const [token, setToken] = useState(config.token);
  const [authMode, setAuthMode] = useState<"token" | "password">(config.authMode);
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await connect({ url, token, authMode });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              WhezaClaw
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Connect to your OpenClaw Gateway
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Gateway URL */}
            <div className="space-y-2">
              <Label htmlFor="url" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Gateway URL
              </Label>
              <div className="relative">
                <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://127.0.0.1:18789"
                  className="pl-10 bg-background/50 border-border/50 focus:border-purple-500/50"
                  required
                />
              </div>
            </div>

            {/* Auth Mode */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Auth Mode
              </Label>
              <Select value={authMode} onValueChange={(v: "token" | "password") => setAuthMode(v)}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token">Token</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Token / Password */}
            <div className="space-y-2">
              <Label htmlFor="token" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {authMode === "token" ? "Auth Token" : "Password"}
              </Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={authMode === "token" ? "Enter gateway token..." : "Enter gateway password..."}
                  className="pr-10 bg-background/50 border-border/50 focus:border-purple-500/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <WifiOff className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold h-11 shadow-lg shadow-purple-500/25 transition-all"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
