"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";

export function AdminTopBar({ title = "Admin console" }: { title?: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              C
            </span>
            CivicSync
          </Link>
          <span className="hidden text-muted-foreground md:inline">/</span>
          <span className="hidden text-sm font-medium text-foreground md:inline">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground sm:flex"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <ThemeToggle />
          <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground md:inline">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
