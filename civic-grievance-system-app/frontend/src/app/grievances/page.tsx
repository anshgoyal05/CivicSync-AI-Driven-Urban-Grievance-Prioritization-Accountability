"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { RequireAuth } from "@/components/RequireAuth";
import { FadeIn } from "@/components/Motion";
import { Badge, Card } from "@/components/ui";
import { api } from "@/lib/api";
import type { Grievance } from "@/lib/types";

export default function MyGrievancesPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const [items, setItems] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Grievance[]>("/grievances/my")
      .then((r) => setItems(r.data))
      .catch(() => toast.error("Failed to load grievances"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <FadeIn>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">My grievances</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Track status, department assignment, and AI priority explanations.
            </p>
          </div>
          <Link
            href="/submit"
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.98]"
          >
            New grievance
          </Link>
        </div>
      </FadeIn>

      {loading ? (
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 w-40 rounded bg-zinc-200/80 dark:bg-zinc-800/70" />
              <div className="mt-3 h-6 w-2/3 rounded bg-zinc-200/80 dark:bg-zinc-800/70" />
              <div className="mt-3 h-4 w-1/2 rounded bg-zinc-200/80 dark:bg-zinc-800/70" />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <FadeIn delay={0.05}>
          <Card className="mt-6">
            <div className="text-lg font-bold">No grievances yet</div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Submit your first complaint. You’ll instantly see predicted priority, assigned department, and status tracking.
            </div>
            <div className="mt-4">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.98]"
              >
                Submit a grievance
              </Link>
            </div>
          </Card>
        </FadeIn>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((g) => (
            <Link key={g.id} href={`/grievances/${g.id}`} className="block">
              <Card className="group transition hover:border-sky-200 dark:hover:border-sky-800">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-zinc-500">
                      #{g.id} • {new Date(g.created_at).toLocaleString()}
                    </div>
                    <div className="mt-1 text-lg font-bold">{g.title}</div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {g.region_state} / {g.region_city} / {g.region_sector} • {g.department}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={g.predicted_priority} />
                    <Badge className="border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
                      {g.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Grievance["predicted_priority"] }) {
  const cls =
    priority === "Critical"
      ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
      : priority === "High"
        ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200"
        : priority === "Medium"
          ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
  return <Badge className={cls}>{priority}</Badge>;
}

