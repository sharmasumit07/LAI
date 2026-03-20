"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// ProjectLocationMap — Interactive map using react-leaflet
//
// Install required packages:
//   npm install leaflet react-leaflet
//   npm install -D @types/leaflet
//
// Add to your global CSS (index.css or globals.css):
//   @import "leaflet/dist/leaflet.css";
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Popup,
  Marker,
  LayersControl,
  useMap,
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import L from "leaflet";
import { cn } from "@/react-app/lib/utils";
import type {
  Ampel,
  WEAStatus,
  InfraPoint,
} from "@/react-app/lib/ddiqDemoData";

// Fix Leaflet default icon path issue in bundlers
import "leaflet/dist/leaflet.css";

// ─── Constants ──────────────────────────────────────────────────────────────

const AMPEL_HEX: Record<Ampel, string> = {
  green: "#059669",
  yellow: "#d97706",
  red: "#dc2626",
};

const AMPEL_LABEL: Record<Ampel, string> = {
  green: "Secured",
  yellow: "Partial",
  red: "Open",
};

const AMPEL_BG: Record<Ampel, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-rose-500",
};

// ─── Custom icon builder ────────────────────────────────────────────────────

function createWEAIcon(ampel: Ampel, label: string): L.DivIcon {
  const color = AMPEL_HEX[ampel];
  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
    html: `<div style="position:relative;width:32px;height:32px;">
      <div style="
        position:absolute;inset:0;
        background:${color};
        border:2.5px solid #1e293b;
        border-radius:50%;
        box-shadow:0 2px 8px ${color}66, 0 0 0 4px ${color}22;
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="color:white;font-size:10px;font-weight:800;font-family:system-ui;letter-spacing:-0.5px;">${label}</span>
      </div>
    </div>`,
  });
}

function createInfraIcon(type: InfraPoint["type"]): L.DivIcon {
  const config: Record<
    InfraPoint["type"],
    { emoji: string; bg: string; border: string; size: number }
  > = {
    substation: { emoji: "⚡", bg: "#6366f1", border: "#4f46e5", size: 30 },
    cable_start: { emoji: "🔌", bg: "#8b5cf6", border: "#7c3aed", size: 24 },
    cable_end: { emoji: "⚡", bg: "#6366f1", border: "#4f46e5", size: 30 },
    access_road: { emoji: "🛤️", bg: "#64748b", border: "#475569", size: 26 },
  };
  const c = config[type];
  return L.divIcon({
    className: "",
    iconSize: [c.size, c.size],
    iconAnchor: [c.size / 2, c.size / 2],
    popupAnchor: [0, -c.size / 2],
    html: `<div style="
      width:${c.size}px;height:${c.size}px;
      background:${c.bg}22;
      border:2px solid ${c.border};
      border-radius:6px;
      display:flex;align-items:center;justify-content:center;
      font-size:${c.size * 0.5}px;
      box-shadow:0 2px 6px rgba(0,0,0,0.2);
    ">${c.emoji}</div>`,
  });
}

// ─── Auto-fit bounds helper ─────────────────────────────────────────────────

function FitBounds({
  statuses,
  infra,
}: {
  statuses: WEAStatus[];
  infra: InfraPoint[];
}) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current) return;
    const points: L.LatLngExpression[] = [
      ...statuses.map((w) => [w.lat, w.lng] as L.LatLngExpression),
      ...infra.map((p) => [p.lat, p.lng] as L.LatLngExpression),
    ];
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
      fitted.current = true;
    }
  }, [map, statuses, infra]);

  return null;
}

// ─── Legend control ──────────────────────────────────────────────────────────

function LegendControl({
  statuses,
  projectName,
}: {
  statuses: WEAStatus[];
  projectName: string;
}) {
  const map = useMap();

  useEffect(() => {
    const legend = new L.Control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div");
      const counts = {
        green: statuses.filter((s) => s.ampel === "green").length,
        yellow: statuses.filter((s) => s.ampel === "yellow").length,
        red: statuses.filter((s) => s.ampel === "red").length,
      };
      div.innerHTML = `
        <div style="background:white;padding:12px 16px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.15);font-family:system-ui;min-width:160px;border:1px solid #e2e8f0;">
          <div style="font-weight:700;font-size:12px;color:#1e293b;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #f1f5f9;">${projectName}</div>
          <div style="display:flex;flex-direction:column;gap:5px;font-size:11px;color:#475569;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="width:10px;height:10px;border-radius:50%;background:#059669;border:1.5px solid #1e293b;flex-shrink:0;"></span>
              Secured (${counts.green})
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="width:10px;height:10px;border-radius:50%;background:#d97706;border:1.5px solid #1e293b;flex-shrink:0;"></span>
              In Negotiation (${counts.yellow})
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="width:10px;height:10px;border-radius:50%;background:#dc2626;border:1.5px solid #1e293b;flex-shrink:0;"></span>
              Open Issues (${counts.red})
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:2px;padding-top:5px;border-top:1px solid #f1f5f9;">
              <span style="width:10px;height:2px;background:#6366f1;flex-shrink:0;border-radius:1px;"></span>
              Cable Route
            </div>
          </div>
        </div>
      `;
      return div;
    };

    legend.addTo(map);
    return () => {
      legend.remove();
    };
  }, [map, statuses, projectName]);

  return null;
}

// ─── Tile layer URLs ────────────────────────────────────────────────────────

const TILE_LAYERS = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    name: "Street Map",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      '&copy; <a href="https://www.esri.com">Esri</a> &mdash; World Imagery',
    name: "Satellite",
  },
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    name: "Topographic",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ProjectLocationMapProps {
  statuses: WEAStatus[];
  infrastructure: InfraPoint[];
  projectName: string;
  className?: string;
}

export default function ProjectLocationMap({
  statuses,
  infrastructure,
  projectName,
  className,
}: ProjectLocationMapProps) {
  // Calculate center from all points
  const center: [number, number] = [
    statuses.reduce((s, w) => s + w.lat, 0) / (statuses.length || 1),
    statuses.reduce((s, w) => s + w.lng, 0) / (statuses.length || 1),
  ];

  // Cable route coordinates
  const cableStart = infrastructure.find((p) => p.type === "cable_start");
  const cableEnd = infrastructure.find((p) => p.type === "cable_end");
  const cableRoute: [number, number][] =
    cableStart && cableEnd
      ? [
          [cableStart.lat, cableStart.lng],
          [cableEnd.lat, cableEnd.lng],
        ]
      : [];

  const counts = {
    green: statuses.filter((s) => s.ampel === "green").length,
    yellow: statuses.filter((s) => s.ampel === "yellow").length,
    red: statuses.filter((s) => s.ampel === "red").length,
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 border-b border-border/40 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Project Location Map</h4>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />{" "}
            {counts.green} Secured
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />{" "}
            {counts.yellow} Partial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />{" "}
            {counts.red} Open
          </span>
          <span>
            {statuses.length} WEA · {infrastructure.length} Infra
          </span>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "480px", width: "100%" }}
        zoomControl={true}
      >
        {/* Layer switcher: Street / Satellite / Topo */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name={TILE_LAYERS.street.name}>
            <TileLayer
              url={TILE_LAYERS.street.url}
              attribution={TILE_LAYERS.street.attribution}
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={TILE_LAYERS.satellite.name}>
            <TileLayer
              url={TILE_LAYERS.satellite.url}
              attribution={TILE_LAYERS.satellite.attribution}
              maxZoom={18}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={TILE_LAYERS.topo.name}>
            <TileLayer
              url={TILE_LAYERS.topo.url}
              attribution={TILE_LAYERS.topo.attribution}
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Auto-fit all markers */}
        <FitBounds statuses={statuses} infra={infrastructure} />

        {/* Legend */}
        <LegendControl statuses={statuses} projectName={projectName} />

        {/* Cable route */}
        {cableRoute.length === 2 && (
          <Polyline
            positions={cableRoute}
            pathOptions={{
              color: "#6366f1",
              weight: 3,
              dashArray: "10 6",
              opacity: 0.8,
            }}
          >
            <Popup>
              <div style={{ fontFamily: "system-ui", fontSize: "13px" }}>
                <strong>Cable Route</strong>
                <br />
                <span style={{ color: "#64748b" }}>
                  4.2 km to Substation Tostedt
                </span>
              </div>
            </Popup>
          </Polyline>
        )}

        {/* Infrastructure markers */}
        {infrastructure
          .filter((p) => p.type !== "cable_start")
          .map((p) => (
            <Marker
              key={p.name}
              position={[p.lat, p.lng]}
              icon={createInfraIcon(p.type)}
            >
              <Popup>
                <div
                  style={{
                    fontFamily: "system-ui",
                    fontSize: "13px",
                    minWidth: "140px",
                  }}
                >
                  <strong>{p.name}</strong>
                  <br />
                  <span style={{ color: "#64748b", fontSize: "12px" }}>
                    {p.type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <br />
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                    {p.lat.toFixed(5)}°N, {p.lng.toFixed(5)}°E
                  </span>
                </div>
              </Popup>
              <LeafletTooltip
                direction="top"
                offset={[0, -14]}
                permanent={false}
              >
                {p.name}
              </LeafletTooltip>
            </Marker>
          ))}

        {/* WEA markers */}
        {statuses.map((w) => (
          <Marker
            key={w.name}
            position={[w.lat, w.lng]}
            icon={createWEAIcon(w.ampel, w.name.replace("WEA ", "T"))}
          >
            <Popup>
              <div
                style={{
                  fontFamily: "system-ui",
                  fontSize: "13px",
                  minWidth: "220px",
                  lineHeight: "1.6",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    paddingBottom: "6px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: AMPEL_HEX[w.ampel],
                      border: "1.5px solid #1e293b",
                      flexShrink: 0,
                    }}
                  />
                  <strong style={{ fontSize: "14px" }}>{w.name}</strong>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: `${AMPEL_HEX[w.ampel]}18`,
                      color: AMPEL_HEX[w.ampel],
                    }}
                  >
                    {AMPEL_LABEL[w.ampel]}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569" }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>
                      Owner:
                    </span>{" "}
                    {w.owner}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>
                      Parcel:
                    </span>{" "}
                    {w.parcel}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>
                      Address:
                    </span>{" "}
                    {w.address}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>
                      Contract:
                    </span>{" "}
                    {w.contract}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    paddingTop: "6px",
                    borderTop: "1px solid #f1f5f9",
                    fontSize: "11px",
                    color: "#94a3b8",
                  }}
                >
                  {w.lat.toFixed(5)}°N, {w.lng.toFixed(5)}°E
                </div>
              </div>
            </Popup>
            <LeafletTooltip direction="top" offset={[0, -18]} permanent={false}>
              {w.name} — {AMPEL_LABEL[w.ampel]}
            </LeafletTooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Coordinate reference below map */}
      <div className="border-t border-border/40">
        <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/30">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Turbine Coordinates
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5">
            {statuses.map((w) => (
              <div
                key={w.name}
                className="flex items-center gap-1.5 text-[11px]"
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full inline-block",
                    AMPEL_BG[w.ampel],
                  )}
                />
                <span className="font-semibold">{w.name}</span>
                <span className="text-muted-foreground">
                  {w.lat.toFixed(4)}°, {w.lng.toFixed(4)}°
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
