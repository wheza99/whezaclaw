"use client";

import { ConnectionProvider } from "@/lib/connection-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ConnectionProvider>{children}</ConnectionProvider>;
}
