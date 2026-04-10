"use client";

import * as React from "react";
import { useConnection } from "@/lib/connection-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Bot,
  MessageSquare,
  Settings,
  LayoutDashboard,
  Zap,
  LogOut,
} from "lucide-react";

const navItems = [
  { id: "sessions", title: "Sessions", icon: <MessageSquare className="size-4" /> },
  { id: "agents", title: "Agents", icon: <Bot className="size-4" /> },
  { id: "dashboard", title: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { id: "settings", title: "Settings", icon: <Settings className="size-4" /> },
];

interface NavState {
  activeNav: string;
  activeSession: string | null;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navState: NavState;
  onNavChange: (state: NavState) => void;
  sessions: Array<{
    key: string;
    label?: string;
    displayName: string;
    status: string;
    model: string;
    updatedAt: number;
    kind: string;
    channel: string;
  }>;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export function AppSidebar({ navState, onNavChange, sessions, ...props }: AppSidebarProps) {
  const { config, disconnect, isConnected } = useConnection();
  const { setOpen } = useSidebar();

  const activeItem = navItems.find((i) => i.id === navState.activeNav) || navItems[0];

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* Icon sidebar */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r border-border/50"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="md:h-8 md:p-0">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
                  <Zap className="size-4 text-white" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      tooltip={{ children: item.title, hidden: false }}
                      onClick={() => {
                        onNavChange({ ...navState, activeNav: item.id, activeSession: null });
                        setOpen(true);
                      }}
                      isActive={navState.activeNav === item.id}
                      className="px-2.5 md:px-2"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={{ children: "Disconnect", hidden: false }}
                onClick={disconnect}
                className="px-2.5 md:px-2 text-destructive hover:text-destructive"
              >
                <LogOut className="size-4" />
                <span>Disconnect</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* List sidebar */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3 border-b border-border/50 p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeItem.title}
            </div>
            <span className="text-xs text-muted-foreground">
              {sessions.length}
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {sessions.map((session) => (
                <button
                  key={session.key}
                  onClick={() =>
                    onNavChange({
                      activeNav: "sessions",
                      activeSession: session.key,
                    })
                  }
                  className={`flex flex-col items-start gap-1.5 border-b border-border/30 p-3 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-left transition-colors ${
                    navState.activeSession === session.key
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : ""
                  }`}
                >
                  <div className="flex w-full items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        session.status === "running"
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                    <span className="truncate text-sm font-medium">
                      {session.label || session.displayName}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                      {formatRelativeTime(session.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-4">
                    <span>{session.model}</span>
                    <span>·</span>
                    <span>{session.channel}</span>
                  </div>
                </button>
              ))}

              {sessions.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No sessions found
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
