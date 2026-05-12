"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { RequireAuth } from "@/components/RequireAuth";
import { FadeIn } from "@/components/Motion";
import { Modal } from "@/components/Modal";
import { Badge, Button, Card, Input, Select } from "@/components/ui";
import { api } from "@/lib/api";
import type { Analytics, Grievance, Regions } from "@/lib/types";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

const PRIORITIES: Array<Grievance["predicted_priority"] | ""> = ["", "Low", "Medium", "High", "Critical"];
const STATUSES: Array<Grievance["status"] | ""> = ["", "Pending", "In Progress", "Resolved"];
const SEVERITY_SCORE: Record<Grievance["predicted_priority"], number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};
const MAP_DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const MAP_DEFAULT_ZOOM = 5;

export default function AdminPage() {
  return (
    <RequireAuth role="admin">
      <AdminInner />
    </RequireAuth>
  );
}

function AdminInner() {
  const [regions, setRegions] = useState<Regions | null>(null);
  const [items, setItems] = useState<Grievance[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selected, setSelected] = useState<Grievance | null>(null);

  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [sector, setSector] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [panelPriorityFilter, setPanelPriorityFilter] = useState<Grievance["predicted_priority"] | "">("");
  const [panelStatusFilter, setPanelStatusFilter] = useState<"all" | "open" | "resolved">("all");
  const [panelSort, setPanelSort] = useState<"latest" | "severity">("latest");
  const [activeAreaKey, setActiveAreaKey] = useState<string | null>(null);

  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const areaLayerRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    api
      .get<Regions>("/regions")
      .then((r) => setRegions(r.data))
      .catch(() => toast.error("Failed to load regions"));
  }, []);

  const states = useMemo(() => Object.keys(regions ?? {}).sort(), [regions]);
  const cities = useMemo(() => {
    if (!state || !regions?.[state]) return [];
    return Object.keys(regions[state]).sort();
  }, [regions, state]);
  const sectors = useMemo(() => {
    if (!state || !city || !regions?.[state]?.[city]) return [];
    return regions[state][city];
  }, [regions, state, city]);

  const load = async () => {
    const res = await api.get<Grievance[]>("/admin/grievances", {
      params: {
        state: state || undefined,
        city: city || undefined,
        sector: sector || undefined,
        priority: priority || undefined,
        status: status || undefined,
        department: department || undefined,
        search: search || undefined,
      },
    });
    setItems(res.data);
  };

  const loadAnalytics = async () => {
    const res = await api.get<Analytics>("/analytics");
    setAnalytics(res.data);
  };

  useEffect(() => {
    Promise.all([load(), loadAnalytics()]).catch(() => toast.error("Failed to load admin data"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: number, newStatus: Grievance["status"]) => {
    try {
      await api.patch(`/admin/grievances/${id}/status`, { new_status: newStatus });
      toast.success("Status updated");
      await Promise.all([load(), loadAnalytics()]);
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, "Failed to update status"));
    }
  };

  const exportCsv = async () => {
    try {
      const res = await api.get("/admin/grievances/export", {
        params: {
          state: state || undefined,
          city: city || undefined,
          sector: sector || undefined,
          priority: priority || undefined,
          status: status || undefined,
          department: department || undefined,
          search: search || undefined,
        },
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
    } catch {
      toast.error("Export failed");
    }
  };

  const departments = useMemo(() => {
    const unique = new Set(items.map((i) => i.department));
    return Array.from(unique).sort();
  }, [items]);

  const preAreaPanelItems = useMemo(() => {
    const filtered = items.filter((g) => {
      if (panelPriorityFilter && g.predicted_priority !== panelPriorityFilter) return false;
      if (panelStatusFilter === "open" && g.status === "Resolved") return false;
      if (panelStatusFilter === "resolved" && g.status !== "Resolved") return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (panelSort === "severity") {
        const bySeverity = SEVERITY_SCORE[b.predicted_priority] - SEVERITY_SCORE[a.predicted_priority];
        if (bySeverity !== 0) return bySeverity;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [items, panelPriorityFilter, panelSort, panelStatusFilter]);

  const areaBuckets = useMemo(() => {
    const grouped = new Map<string, { id: string; label: string; complaints: Grievance[]; latSum: number; lonSum: number }>();
    preAreaPanelItems.forEach((g) => {
      if (g.latitude == null || g.longitude == null) return;
      const key = getAreaKey(g);
      const label = `${g.region_state} / ${g.region_city}`;
      const current = grouped.get(key);
      if (!current) {
        grouped.set(key, {
          id: key,
          label,
          complaints: [g],
          latSum: g.latitude,
          lonSum: g.longitude,
        });
        return;
      }
      current.complaints.push(g);
      current.latSum += g.latitude;
      current.lonSum += g.longitude;
    });

    return Array.from(grouped.values()).map((bucket) => ({
      id: bucket.id,
      label: bucket.label,
      complaints: bucket.complaints,
      center: [bucket.latSum / bucket.complaints.length, bucket.lonSum / bucket.complaints.length] as [number, number],
    }));
  }, [preAreaPanelItems]);

  useEffect(() => {
    if (!activeAreaKey) return;
    const exists = areaBuckets.some((bucket) => bucket.id === activeAreaKey);
    if (!exists) setActiveAreaKey(null);
  }, [activeAreaKey, areaBuckets]);

  const panelItems = useMemo(() => {
    if (!activeAreaKey) return preAreaPanelItems;
    return preAreaPanelItems.filter((g) => getAreaKey(g) === activeAreaKey);
  }, [activeAreaKey, preAreaPanelItems]);

  const mappableItems = useMemo(
    () => panelItems.filter((g) => g.latitude != null && g.longitude != null),
    [panelItems],
  );

  const activeArea = useMemo(
    () => areaBuckets.find((bucket) => bucket.id === activeAreaKey) ?? null,
    [activeAreaKey, areaBuckets],
  );

  useEffect(() => {
    let cancelled = false;

    const setupMap = async () => {
      if (!mapHostRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !mapHostRef.current) return;
      const map = L.map(mapHostRef.current, { zoomControl: true }).setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      const markerLayer = L.layerGroup().addTo(map);
      const areaLayer = L.layerGroup().addTo(map);
      mapRef.current = map;
      markerLayerRef.current = markerLayer;
      areaLayerRef.current = areaLayer;
    };

    void setupMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerLayerRef.current = null;
      areaLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const drawMapLayers = async () => {
      if (!mapRef.current || !markerLayerRef.current || !areaLayerRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !mapRef.current || !markerLayerRef.current || !areaLayerRef.current) return;

      markerLayerRef.current.clearLayers();
      areaLayerRef.current.clearLayers();
      const points: [number, number][] = [];

      areaBuckets.forEach((bucket) => {
        const isActive = bucket.id === activeAreaKey;
        const areaMarker = L.circle(bucket.center, {
          radius: Math.min(2200 + bucket.complaints.length * 350, 7000),
          color: isActive ? "#0ea5e9" : "#334155",
          fillColor: isActive ? "#38bdf8" : "#94a3b8",
          fillOpacity: isActive ? 0.28 : 0.18,
          weight: isActive ? 2.5 : 1.5,
        });
        areaMarker.bindTooltip(`${bucket.label} (${bucket.complaints.length})`, { direction: "top" });
        areaMarker.on("click", () => {
          setActiveAreaKey(bucket.id);
          if (mapRef.current) mapRef.current.flyTo(bucket.center, 11, { duration: 0.8 });
        });
        areaMarker.addTo(areaLayerRef.current!);
      });

      mappableItems.forEach((g) => {
        if (g.latitude == null || g.longitude == null) return;
        const point: [number, number] = [g.latitude, g.longitude];
        points.push(point);
        const marker = L.circleMarker(point, {
          radius: selected?.id === g.id ? 10 : 8,
          color: getPriorityColor(g.predicted_priority),
          fillColor: getPriorityColor(g.predicted_priority),
          fillOpacity: 0.85,
          weight: selected?.id === g.id ? 3 : 2,
        });
        marker.bindTooltip(`#${g.id} • ${g.title}`, { direction: "top" });
        marker.bindPopup(
          `<div style="min-width:220px">
            <div style="font-weight:700;margin-bottom:4px">#${g.id} ${escapeHtml(g.title)}</div>
            <div style="font-size:12px;color:#475569;margin-bottom:6px">${escapeHtml(truncateText(g.description, 140))}</div>
            <div style="font-size:12px"><strong>Priority:</strong> ${g.predicted_priority}</div>
          </div>`,
        );
        marker.on("click", () => setSelected(g));
        marker.addTo(markerLayerRef.current!);
      });

      if (activeArea && !selected) {
        mapRef.current.flyTo(activeArea.center, 11, { duration: 0.8 });
      } else if (!selected && points.length > 1) {
        mapRef.current.fitBounds(points, { padding: [30, 30] });
      } else if (!selected && points.length === 1) {
        mapRef.current.setView(points[0], 12);
      } else if (!selected && points.length === 0) {
        mapRef.current.setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);
      }
    };

    void drawMapLayers();
    return () => {
      cancelled = true;
    };
  }, [activeArea, activeAreaKey, areaBuckets, mappableItems, selected]);

  useEffect(() => {
    if (!selected || !mapRef.current || selected.latitude == null || selected.longitude == null) return;
    mapRef.current.flyTo([selected.latitude, selected.longitude], 13, { duration: 0.8 });
  }, [selected]);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Admin dashboard</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Filter by region/priority/status/department, update status with audit logs, and view analytics.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.03}>
        <Card>
        <div className="grid gap-3 md:grid-cols-6">
          <div>
            <div className="text-xs font-semibold text-zinc-500">State</div>
            <Select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setCity("");
                setSector("");
              }}
            >
              <option value="">All</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-500">City</div>
            <Select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setSector("");
              }}
              disabled={!state}
            >
              <option value="">All</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-500">Sector</div>
            <Select value={sector} onChange={(e) => setSector(e.target.value)} disabled={!city}>
              <option value="">All</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-500">Priority</div>
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p || "all"} value={p}>
                  {p || "All"}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-500">Status</div>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s || "all"} value={s}>
                  {s || "All"}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-500">Department</div>
            <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">All</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-6">
          <div className="md:col-span-4">
            <div className="text-xs font-semibold text-zinc-500">Search</div>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title/description keyword…" />
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <Button onClick={() => void load().catch(() => toast.error("Load failed"))} className="w-full">
              Apply filters
            </Button>
            <Button
              onClick={() => void exportCsv()}
              className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Export CSV
            </Button>
          </div>
        </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.06}>
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Complaint map</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {mappableItems.length} geotagged complaints
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeArea ? (
                  <Badge className="border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
                    Area: {activeArea.label}
                  </Badge>
                ) : null}
                <Button
                  className="bg-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
                  onClick={() => setActiveAreaKey(null)}
                  disabled={!activeAreaKey}
                >
                  Clear area
                </Button>
              </div>
            </div>
            <div className="relative h-[560px] overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
              <div ref={mapHostRef} className="h-full w-full" />
              {mappableItems.length === 0 ? (
                <div className="absolute inset-0 grid place-items-center bg-white/80 text-sm text-zinc-600 backdrop-blur-sm dark:bg-zinc-950/80 dark:text-zinc-300">
                  No complaints with coordinates for current filters.
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">Complaints ({panelItems.length})</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activeArea ? `Filtered by map area: ${activeArea.label}` : "Select a region bubble on map to filter"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div>
                <div className="mb-1 text-xs font-semibold text-zinc-500">Priority</div>
                <Select
                  value={panelPriorityFilter}
                  onChange={(e) => setPanelPriorityFilter(e.target.value as Grievance["predicted_priority"] | "")}
                >
                  <option value="">All</option>
                  {PRIORITIES.filter(Boolean).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-zinc-500">Status</div>
                <Select
                  value={panelStatusFilter}
                  onChange={(e) => setPanelStatusFilter(e.target.value as "all" | "open" | "resolved")}
                >
                  <option value="all">All</option>
                  <option value="open">Open only</option>
                  <option value="resolved">Resolved only</option>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-zinc-500">Sort</div>
                <Select value={panelSort} onChange={(e) => setPanelSort(e.target.value as "latest" | "severity")}>
                  <option value="latest">Latest</option>
                  <option value="severity">Severity</option>
                </Select>
              </div>
            </div>

            <div className="mt-4 max-h-[460px] space-y-3 overflow-y-auto pr-1">
              {panelItems.map((g) => (
                <div
                  key={g.id}
                  className="group relative w-full rounded-2xl border border-zinc-200/80 bg-white/70 p-4 text-left transition hover:border-sky-300 hover:bg-sky-50/50 dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-sky-800 dark:hover:bg-sky-950/20"
                >
                  <div
                    className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full"
                    style={{ backgroundColor: getPriorityColor(g.predicted_priority) }}
                  />
                  <div className="ml-2 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                          #{g.id} {g.title}
                        </div>
                        <div className="mt-0.5 text-xs text-zinc-500">{new Date(g.created_at).toLocaleString()}</div>
                      </div>
                      <PriorityBadge priority={g.predicted_priority} />
                    </div>

                    <div className="text-sm text-zinc-600 dark:text-zinc-300">{truncateText(g.description, 120)}</div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <Badge className="border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
                        {g.status}
                      </Badge>
                      <span>{g.department}</span>
                      <span>•</span>
                      <span>
                        {g.region_city}, {g.region_sector}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        className="bg-sky-600 px-3 py-1 text-xs hover:bg-sky-700"
                        onClick={() => setSelected(g)}
                      >
                        View details
                      </Button>
                      <Button
                        className="bg-amber-600 px-3 py-1 text-xs hover:bg-amber-700"
                        onClick={() => void updateStatus(g.id, "In Progress")}
                        disabled={g.status === "In Progress" || g.status === "Resolved"}
                      >
                        Mark In Progress
                      </Button>
                      <Button
                        className="bg-emerald-600 px-3 py-1 text-xs hover:bg-emerald-700"
                        onClick={() => void updateStatus(g.id, "Resolved")}
                        disabled={g.status === "Resolved"}
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {panelItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                  No complaints found for selected filters.
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </FadeIn>

      {analytics ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="text-sm font-semibold">Complaints by priority</div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.complaints_by_priority}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0284c7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <div className="text-sm font-semibold">Monthly trend</div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      ) : null}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Complaint #${selected.id}` : "Complaint"}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={selected.predicted_priority} />
              <Badge className="border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
                {selected.status}
              </Badge>
              <Badge className="border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
                {selected.department}
              </Badge>
            </div>

            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              {selected.region_state} / {selected.region_city} / {selected.region_sector} •{" "}
              {new Date(selected.created_at).toLocaleString()}
            </div>
            {selected.latitude != null && selected.longitude != null ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                Location: {selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}{" "}
                <a
                  href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400"
                >
                  View on map →
                </a>
              </div>
            ) : null}

            <div>
              <div className="text-sm font-semibold">Description</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">
                {selected.description}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">AI explanation</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">
                {selected.ai_explanation}
              </div>
            </div>

            {selected.image_path ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveUploadUrl(selected.image_path)}
                  alt="Evidence"
                  className="max-h-[420px] w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Grievance["predicted_priority"] }) {
  const icon = priority === "Critical" ? "🔴" : priority === "High" ? "🟡" : "🟢";
  const cls =
    priority === "Critical"
      ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
      : priority === "High"
        ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200"
        : priority === "Medium"
          ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
  return <Badge className={cls}>{icon} {priority}</Badge>;
}

function getPriorityColor(priority: Grievance["predicted_priority"]) {
  if (priority === "Critical") return "#dc2626";
  if (priority === "High") return "#f59e0b";
  if (priority === "Medium") return "#fbbf24";
  return "#16a34a";
}

function truncateText(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}...`;
}

function getAreaKey(grievance: Grievance) {
  return `${grievance.region_state}__${grievance.region_city}`;
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) return response.data.detail;
  }
  return fallback;
}

function resolveUploadUrl(imagePath: string) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1";
  try {
    const origin = new URL(base).origin;
    return `${origin}${imagePath}`;
  } catch {
    return `http://localhost:8000${imagePath}`;
  }
}

