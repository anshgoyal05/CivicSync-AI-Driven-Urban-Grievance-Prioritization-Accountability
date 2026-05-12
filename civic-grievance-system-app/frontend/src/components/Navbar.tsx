"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Button, cn } from "@/components/ui";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/65 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/55">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-sm">
            CS
          </span>
          <span>CivicSync</span>
        </Link>
        <nav className="flex items-center gap-3">
          {user?.role === "admin" ? (
            <Link className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/admin">
              Admin
            </Link>
          ) : null}
          {user ? (
            <>
              <Link className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/submit">
                Submit
              </Link>
              <Link className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/grievances">
                My Grievances
              </Link>
            </>
          ) : null}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/70 bg-white/70 text-zinc-700 shadow-sm transition hover:bg-white active:scale-[0.98] dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:text-zinc-200 dark:hover:bg-zinc-900",
            )}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <Button className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

