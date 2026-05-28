"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { GlassCard } from "@/components/glass-card";
import { RequireAuth } from "@/components/RequireAuth";
import { FadeIn } from "@/components/Motion";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/civic-ui";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { Grievance } from "@/lib/types";

export default function GrievanceDetailPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [g, setG] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(true);
  const [openImage, setOpenImage] = useState(false);

  useEffect(() => {
    api
      .get<Grievance>(`/grievances/${id}`)
      .then((r) => setG(r.data))
      .catch(() => toast.error("Failed to load grievance"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>;
  }
  if (!g) {
    return (
      <GlassCard className="py-16 text-center">
        <p className="text-muted-foreground">Grievance not found.</p>
        <Link href="/grievances" className="mt-4 inline-block text-primary hover:underline">
          ← Back to list
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/grievances"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my grievances
      </Link>

      <FadeIn>
        <GlassCard>
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-sm text-muted-foreground">
                #{g.id} • {new Date(g.created_at).toLocaleString()}
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{g.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {g.category} • {g.region_state} / {g.region_city} / {g.region_sector}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={g.predicted_priority} />
              <Badge className="border-border text-foreground">{g.status}</Badge>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
              <div className="text-xs font-medium uppercase text-muted-foreground">Department</div>
              <div className="mt-1 font-semibold text-foreground">{g.department}</div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
              <div className="text-xs font-medium uppercase text-muted-foreground">AI confidence</div>
              <div className="mt-1 font-semibold text-foreground">{Math.round(g.confidence_score * 100)}%</div>
            </div>
            {g.latitude != null && g.longitude != null ? (
              <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4 md:col-span-2">
                <div className="text-xs font-medium uppercase text-muted-foreground">Location</div>
                <div className="mt-1 font-semibold text-foreground">
                  {g.latitude.toFixed(6)}, {g.longitude.toFixed(6)}
                </div>
                <a
                  href={`https://www.google.com/maps?q=${g.latitude},${g.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-primary hover:underline"
                >
                  Open in Google Maps →
                </a>
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{g.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground">AI explanation</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{g.ai_explanation}</p>
          </div>
        </GlassCard>
      </FadeIn>

      {g.image_path ? (
        <FadeIn delay={0.05}>
          <GlassCard>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Photo evidence</h2>
              <button
                type="button"
                onClick={() => setOpenImage(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Full preview
              </button>
            </div>
            <button type="button" onClick={() => setOpenImage(true)} className="mt-3 block w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveUploadUrl(g.image_path)}
                alt="Evidence"
                className="h-80 w-full rounded-2xl object-cover"
              />
            </button>
          </GlassCard>
        </FadeIn>
      ) : null}

      <Modal open={openImage} onClose={() => setOpenImage(false)} title={`Grievance #${g.id} • Evidence`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resolveUploadUrl(g.image_path!)} alt="Evidence" className="w-full rounded-2xl object-contain" />
      </Modal>
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

function resolveUploadUrl(imagePath: string) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1";
  try {
    return `${new URL(base).origin}${imagePath}`;
  } catch {
    return `http://localhost:8000${imagePath}`;
  }
}
