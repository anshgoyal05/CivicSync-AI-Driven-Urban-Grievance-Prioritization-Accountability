"use client";

import { AppShell } from "@/components/app-shell";

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
