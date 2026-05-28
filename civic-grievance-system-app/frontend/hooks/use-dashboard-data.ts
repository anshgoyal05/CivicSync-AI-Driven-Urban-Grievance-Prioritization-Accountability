"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { Analytics, Grievance } from "@/lib/types";

export type DashboardGrievanceRow = {
  numericId: number;
  id: string;
  title: string;
  category: string;
  status: Grievance["status"];
  priority: Grievance["predicted_priority"];
  date: string;
  location: string;
};

export function useDashboardData() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const reload = useCallback(async () => {
    const [gRes, aRes] = await Promise.all([
      api.get<Grievance[]>("/admin/grievances"),
      api.get<Analytics>("/analytics"),
    ]);
    setGrievances(gRes.data);
    setAnalytics(aRes.data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } catch {
        if (!cancelled) toast.error("Could not load dashboard (admin login required)");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const exportCsv = async () => {
    try {
      const res = await api.get("/admin/grievances/export", {
        params: search ? { search } : undefined,
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "grievances.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return grievances;
    return grievances.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        String(g.id).includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.region_city.toLowerCase().includes(q),
    );
  }, [grievances, search]);

  const stats = useMemo(() => {
    const total = grievances.length;
    const pending = grievances.filter((g) => g.status === "Pending").length;
    const resolvedToday = grievances.filter((g) => {
      if (g.status !== "Resolved") return false;
      return new Date(g.updated_at).toDateString() === new Date().toDateString();
    }).length;
    const inProgress = grievances.filter((g) => g.status === "In Progress").length;

    return [
      {
        label: "Total Grievances",
        value: total.toLocaleString(),
        change: analytics ? `${analytics.monthly_trend.at(-1)?.count ?? 0} this month` : "—",
        trend: "up" as const,
      },
      {
        label: "Pending Review",
        value: pending.toLocaleString(),
        change: `${inProgress} in progress`,
        trend: "down" as const,
      },
      {
        label: "Resolved Today",
        value: String(resolvedToday),
        change: total ? `${Math.round((resolvedToday / total) * 100)}% of total` : "0%",
        trend: "up" as const,
      },
      {
        label: "Regions Active",
        value: String(analytics?.complaints_by_region.length ?? 0),
        change: "live from API",
        trend: "up" as const,
      },
    ];
  }, [grievances, analytics]);

  const rows: DashboardGrievanceRow[] = useMemo(
    () =>
      filtered.slice(0, 25).map((g) => ({
        numericId: g.id,
        id: `GRV-${g.id}`,
        title: g.title,
        category: g.category,
        status: g.status,
        priority: g.predicted_priority,
        date: new Date(g.created_at).toISOString().slice(0, 10),
        location: `${g.region_city}, ${g.region_state}`,
      })),
    [filtered],
  );

  const regionChart = useMemo(
    () =>
      (analytics?.complaints_by_region ?? []).slice(0, 8).map((r) => ({
        region: r.label,
        count: r.count,
      })),
    [analytics],
  );

  return {
    loading,
    stats,
    rows,
    total: filtered.length,
    allTotal: grievances.length,
    analytics,
    grievances: filtered,
    search,
    setSearch,
    exportCsv,
    reload,
    regionChart,
  };
}
