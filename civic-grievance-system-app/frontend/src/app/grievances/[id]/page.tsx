"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

import { RequireAuth } from "@/components/RequireAuth";
import { FadeIn } from "@/components/Motion";
import { Modal } from "@/components/Modal";
import { Badge, Card } from "@/components/ui";
import { api } from "@/lib/api";
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

  if (loading) return <div className="py-16 text-center text-sm text-zinc-500">Loading…</div>;
  if (!g) return <div className="py-16 text-center text-sm text-zinc-600 dark:text-zinc-300">Not found.</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <FadeIn>
        <Card>
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-500">
              #{g.id} • {new Date(g.created_at).toLocaleString()}
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{g.title}</h2>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {g.category} • {g.region_state} / {g.region_city} / {g.region_sector}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={g.predicted_priority} />
            <Badge className="border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">{g.status}</Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Assigned department</div>
            <div className="mt-1 text-sm font-semibold">{g.department}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">AI confidence</div>
            <div className="mt-1 text-sm font-semibold">{Math.round(g.confidence_score * 100)}%</div>
          </div>
          {g.latitude != null && g.longitude != null ? (
            <>
              <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Location</div>
                <div className="mt-1 text-sm font-semibold">
                  {g.latitude.toFixed(6)}, {g.longitude.toFixed(6)}
                </div>
                <a
                  href={`https://www.google.com/maps?q=${g.latitude},${g.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400"
                >
                  View on map →
                </a>
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold">Description</div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">{g.description}</p>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold">AI explanation</div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">{g.ai_explanation}</p>
        </div>
        </Card>
      </FadeIn>

      {g.image_path ? (
        <FadeIn delay={0.05}>
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Uploaded image</div>
              <button
                onClick={() => setOpenImage(true)}
                className="text-sm font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
              >
                Open preview
              </button>
            </div>
            <button
              onClick={() => setOpenImage(true)}
              className="group mt-3 block w-full overflow-hidden rounded-2xl border border-zinc-200/70 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 dark:border-zinc-800/80 dark:hover:border-sky-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveUploadUrl(g.image_path)}
                alt="Evidence"
                className="h-80 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />
            </button>
          </Card>
        </FadeIn>
      ) : null}

      <Modal
        open={openImage}
        onClose={() => setOpenImage(false)}
        title={`Grievance #${g.id} • Evidence`}
      >
        <div className="overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={g.image_path ? resolveUploadUrl(g.image_path) : ""} alt="Evidence full" className="w-full object-contain" />
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          Tip: right click → open image in new tab.
        </div>
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
    const origin = new URL(base).origin;
    return `${origin}${imagePath}`;
  } catch {
    // Fallback for unexpected base URL formats
    return `http://localhost:8000${imagePath}`;
  }
}

