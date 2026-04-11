"use client";

import { useEffect, useState } from "react";
import { useGateway } from "@/lib/use-gateway";
import { Loader2, Bot, User, Wrench, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentBlock {
  type: string;
  text?: string;
  name?: string;
  arguments?: Record<string, unknown>;
  id?: string;
}

interface Message {
  role: string;
  content: ContentBlock[];
  timestamp?: number;
  model?: string;
  provider?: string;
  __openclaw?: { id: string; seq: number };
}

interface ChatViewProps {
  sessionKey: string;
  sessionLabel: string;
}

function formatTime(ts?: number) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function TextBlock({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {text}
    </div>
  );
}

function ToolCallBlock({ name, arguments: args }: { name: string; arguments?: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const argStr = args ? JSON.stringify(args, null, 2) : "";

  return (
    <div className="rounded-lg bg-muted/50 border border-border/30 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Wrench className="w-3 h-3" />
        <span className="font-mono font-medium text-foreground/70">{name}</span>
      </button>
      {open && argStr && (
        <pre className="px-3 pb-2 text-[11px] text-muted-foreground overflow-x-auto">
          <code>{argStr}</code>
        </pre>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  const textBlocks = msg.content?.filter((c) => c.type === "text" && c.text) || [];
  const toolCalls = msg.content?.filter((c) => c.type === "toolCall") || [];
  const toolResults = msg.content?.filter((c) => c.type === "toolResult") || [];

  if (!textBlocks.length && !toolCalls.length && !toolResults.length) return null;

  return (
    <div className={`flex gap-3 max-w-full px-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
          isUser
            ? "bg-blue-500/20 text-blue-400"
            : isSystem
            ? "bg-yellow-500/20 text-yellow-400"
            : "bg-gradient-to-br from-purple-500 to-cyan-500 text-white"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1.5 min-w-0 max-w-[600px] ${isUser ? "items-end" : ""}`}>
        {/* Text */}
        {textBlocks.map((block, i) => (
          <div
            key={i}
            className={`rounded-xl px-3.5 py-2.5 ${
              isUser
                ? "bg-blue-500/15 text-blue-50 rounded-tr-sm"
                : "bg-muted/50 text-foreground rounded-tl-sm"
            }`}
          >
            <TextBlock text={block.text!} />
          </div>
        ))}

        {/* Tool calls */}
        {toolCalls.map((tc, i) => (
          <ToolCallBlock key={i} name={tc.name || "tool"} arguments={tc.arguments as Record<string, unknown>} />
        ))}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground/50 px-1">
          {formatTime(msg.timestamp)}
          {msg.model && ` · ${msg.model}`}
        </span>
      </div>
    </div>
  );
}

export default function ChatView({ sessionKey, sessionLabel }: ChatViewProps) {
  const { fetchHistory } = useGateway();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHistory(sessionKey, 50);
        if (!cancelled) {
          setMessages(data?.messages || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [sessionKey, fetchHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No messages in this session
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={msg.__openclaw?.id || i} msg={msg} />
        ))}
      </div>
    </div>
  );
}
