"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";

export function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "user" | "admin";
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (role && user.role !== role) {
      router.replace("/");
    }
  }, [loading, user, router, pathname, role]);

  if (loading) return <div className="py-16 text-center text-sm text-zinc-500">Loading…</div>;
  if (!user) return null;
  if (role && user.role !== role) return null;
  return <>{children}</>;
}

