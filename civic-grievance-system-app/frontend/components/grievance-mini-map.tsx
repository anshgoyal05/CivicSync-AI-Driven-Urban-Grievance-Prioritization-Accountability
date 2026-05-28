"use client";

import { useEffect, useRef } from "react";

import type { Grievance } from "@/lib/types";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

type GrievanceMiniMapProps = {
  grievances: Grievance[];
  className?: string;
};

export function GrievanceMiniMap({ grievances, className }: GrievanceMiniMapProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance: import("leaflet").Map | null = null;

    const run = async () => {
      if (!hostRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !hostRef.current) return;

      const map = L.map(hostRef.current, { zoomControl: true }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const points: [number, number][] = [];
      grievances.forEach((g) => {
        if (g.latitude == null || g.longitude == null) return;
        const latLng: [number, number] = [g.latitude, g.longitude];
        points.push(latLng);
        L.circleMarker(latLng, {
          radius: 6,
          color: priorityColor(g.predicted_priority),
          fillOpacity: 0.85,
        })
          .bindPopup(`<strong>#${g.id}</strong><br/>${g.title}<br/><em>${g.status}</em>`)
          .addTo(map);
      });

      if (points.length === 1) map.setView(points[0], 12);
      else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [24, 24] });

      mapInstance = map;
    };

    void run();

    return () => {
      cancelled = true;
      mapInstance?.remove();
      mapInstance = null;
    };
  }, [grievances]);

  return (
    <div
      ref={hostRef}
      className={className ?? "h-64 w-full rounded-xl border border-border/40 bg-secondary/20"}
    />
  );
}

function priorityColor(priority: Grievance["predicted_priority"]) {
  switch (priority) {
    case "Critical":
      return "#dc2626";
    case "High":
      return "#ea580c";
    case "Medium":
      return "#d97706";
    default:
      return "#059669";
  }
}
