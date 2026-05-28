"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/navbar";

const STANDALONE_PATHS = ["/", "/login", "/dashboard", "/admin"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = STANDALONE_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)),
  );

  if (standalone) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-28">{children}</main>
    </div>
  );
}
