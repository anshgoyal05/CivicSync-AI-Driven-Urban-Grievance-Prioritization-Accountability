"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { RequireAuth } from "@/components/RequireAuth";
import { FadeIn } from "@/components/Motion";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { api } from "@/lib/api";
import type { Regions } from "@/lib/types";

const schema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.string().min(2),
  region_state: z.string().min(2),
  region_city: z.string().min(2),
  region_sector: z.string().min(1),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORIES = [
  "Roads",
  "Pothole",
  "Streetlight",
  "Garbage",
  "Sewage",
  "Water Supply",
  "Drainage",
  "Traffic",
  "Encroachment",
  "Parks",
  "Noise",
  "Air Pollution",
  "Public Safety",
];

export default function SubmitPage() {
  return (
    <RequireAuth>
      <FadeIn>
        <SubmitInner />
      </FadeIn>
    </RequireAuth>
  );
}

function SubmitInner() {
  const [regions, setRegions] = useState<Regions | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "Roads",
      region_state: "",
      region_city: "",
      region_sector: "",
      latitude: "",
      longitude: "",
    },
  });

  useEffect(() => {
    api
      .get<Regions>("/regions")
      .then((r) => setRegions(r.data))
      .catch(() => toast.error("Failed to load regions"));
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const states = useMemo(() => Object.keys(regions ?? {}).sort(), [regions]);
  const cities = useMemo(() => {
    const st = form.watch("region_state");
    if (!st || !regions?.[st]) return [];
    return Object.keys(regions[st]).sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions, form.watch("region_state")]);
  const sectors = useMemo(() => {
    const st = form.watch("region_state");
    const ct = form.watch("region_city");
    if (!st || !ct || !regions?.[st]?.[ct]) return [];
    return regions[st][ct];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions, form.watch("region_state"), form.watch("region_city")]);

  const onSubmit = async (values: FormValues) => {
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== "") fd.append(k, String(v));
      });
      if (imageFile) fd.append("image", imageFile);

      await api.post("/grievances", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Grievance submitted with AI priority assigned");
      form.reset();
      setImageFile(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Submission failed");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <h2 className="text-xl font-bold">Submit a grievance</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Provide details and optional photo evidence. Priority is assigned automatically.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold">Title</label>
            <Input placeholder="e.g., Huge pothole near school gate" {...form.register("title")} />
            {form.formState.errors.title ? (
              <div className="mt-1 text-xs text-red-600">{form.formState.errors.title.message}</div>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-semibold">Description</label>
            <Textarea rows={6} placeholder="Describe the issue, urgency, and any risks…" {...form.register("description")} />
            {form.formState.errors.description ? (
              <div className="mt-1 text-xs text-red-600">{form.formState.errors.description.message}</div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Category</label>
              <Select {...form.register("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold">State</label>
              <Select
                {...form.register("region_state")}
                onChange={(e) => {
                  form.setValue("region_state", e.target.value);
                  form.setValue("region_city", "");
                  form.setValue("region_sector", "");
                }}
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold">City</label>
              <Select
                {...form.register("region_city")}
                onChange={(e) => {
                  form.setValue("region_city", e.target.value);
                  form.setValue("region_sector", "");
                }}
                disabled={!form.watch("region_state")}
              >
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold">Sector / Area</label>
              <Select {...form.register("region_sector")} disabled={!form.watch("region_city")}>
                <option value="">Select sector/area</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Location latitude (optional)</label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 28.6139"
                {...form.register("latitude")}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Location longitude (optional)</label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 77.2090"
                {...form.register("longitude")}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Upload image (optional)</label>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            {imagePreview ? (
              <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="h-56 w-full object-cover" />
              </div>
            ) : null}
            <p className="mt-2 text-xs text-zinc-500">
              Supported: JPG/PNG/WebP. Max size enforced by server.
            </p>
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
            {form.formState.isSubmitting ? "Submitting…" : "Submit grievance"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

