"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Send } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { GlassCard } from "@/components/glass-card";
import { RequireAuth } from "@/components/RequireAuth";
import { FadeIn } from "@/components/Motion";
import { Button, Input, Select, Textarea } from "@/components/civic-ui";
import { getApiErrorMessage } from "@/lib/api-error";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
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
  const router = useRouter();
  const [regions, setRegions] = useState<Regions | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

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
  const state = form.watch("region_state");
  const city = form.watch("region_city");
  const cities = useMemo(() => {
    if (!state || !regions?.[state]) return [];
    return Object.keys(regions[state]).sort();
  }, [regions, state]);
  const sectors = useMemo(() => {
    if (!state || !city || !regions?.[state]?.[city]) return [];
    return regions[state][city];
  }, [regions, state, city]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setValue("latitude", String(pos.coords.latitude));
        form.setValue("longitude", String(pos.coords.longitude));
        toast.success("Location captured");
        setLocating(false);
      },
      () => {
        toast.error("Could not get your location — enter coordinates manually");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

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
      toast.success("Grievance submitted — AI priority assigned");
      router.push("/grievances");
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, "Submission failed"));
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Submit a grievance</h1>
        <p className="mt-2 text-muted-foreground">
          Describe the issue, pick your area, and optionally attach photo evidence. Our AI assigns priority
          and routes to the right department.
        </p>
      </div>

      <GlassCard>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input placeholder="e.g., Huge pothole near school gate" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.title.message}</p>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              rows={6}
              placeholder="Describe the issue, urgency, and any risks…"
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.description.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select {...form.register("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">State</label>
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
              <label className="text-sm font-medium text-foreground">City</label>
              <Select
                {...form.register("region_city")}
                onChange={(e) => {
                  form.setValue("region_city", e.target.value);
                  form.setValue("region_sector", "");
                }}
                disabled={!state}
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
              <label className="text-sm font-medium text-foreground">Sector / Area</label>
              <Select {...form.register("region_sector")} disabled={!city}>
                <option value="">Select sector/area</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Location (optional)</p>
                <p className="text-xs text-muted-foreground">Helps admins locate the issue on the map</p>
              </div>
              <Button type="button" onClick={useMyLocation} disabled={locating} className="gap-2">
                <MapPin className="h-4 w-4" />
                {locating ? "Locating…" : "Use my location"}
              </Button>
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Input type="number" step="any" placeholder="Latitude" {...form.register("latitude")} />
              <Input type="number" step="any" placeholder="Longitude" {...form.register("longitude")} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Photo evidence (optional)</label>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            {imagePreview ? (
              <div className="mt-3 overflow-hidden rounded-2xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="h-56 w-full object-cover" />
              </div>
            ) : null}
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full gap-2 md:w-auto">
            <Send className="h-4 w-4" />
            {form.formState.isSubmitting ? "Submitting…" : "Submit grievance"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
