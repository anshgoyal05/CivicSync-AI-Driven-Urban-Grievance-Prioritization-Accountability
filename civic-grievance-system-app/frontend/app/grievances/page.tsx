"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";

import { GlassCard } from "@/components/glass-card";
import { RequireAuth } from "@/components/RequireAuth";
import { FadeIn } from "@/components/Motion";
import { Badge } from "@/components/civic-ui";
import { toast } from "@/lib/toast";
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
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">My grievances</h1>
            <p className="mt-2 text-muted-foreground">
              Track status, department assignment, and AI priority explanations.
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            New grievance
          </Link>
        </div>
      </FadeIn>

      {loading ? (
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} className="animate-pulse">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="mt-3 h-6 w-2/3 rounded bg-muted" />
              <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
            </GlassCard>
          ))}
        </div>
      ) : items.length === 0 ? (
        <FadeIn delay={0.05}>
          <GlassCard className="mt-6">
            <div className="text-lg font-semibold text-foreground">No grievances yet</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Submit your first complaint to see AI priority, department routing, and live status updates.
            </p>
            <Link
              href="/submit"
              className="mt-4 inline-flex rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Submit a grievance
            </Link>
          </GlassCard>
        </FadeIn>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((g) => (
            <Link key={g.id} href={`/grievances/${g.id}`} className="block">
              <GlassCard hover className="group">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      #{g.id} • {new Date(g.created_at).toLocaleString()}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{g.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {g.region_state} / {g.region_city} / {g.region_sector} • {g.department}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={g.predicted_priority} />
                    <Badge className="border-border text-foreground">{g.status}</Badge>
                  </div>
                </div>
              </GlassCard>
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

