"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

// ─── Custom WEA icon ────────────────────────────────────────────────────────

function createWEAIcon(ampel: Ampel, label: string): L.DivIcon {
  const c = AMPEL_HEX[ampel];
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
    html: `<div style="width:28px;height:28px;position:relative;">
      <div style="position:absolute;inset:0;background:${c};border:2px solid #fff;border-radius:50%;
        box-shadow:0 1px 4px ${c}88,0 0 0 1.5px #1e293b33;
        display:flex;align-items:center;justify-content:center;">
        <span style="color:#fff;font-size:9px;font-weight:800;font-family:system-ui;">${label}</span>
      </div>
    </div>`,
  });
}

// ─── Custom infrastructure icon ─────────────────────────────────────────────

function createInfraIcon(type: InfraPoint["type"]): L.DivIcon {
  const cfg: Record<
    InfraPoint["type"],
    { emoji: string; bg: string; size: number }
  > = {
    substation: { emoji: "⚡", bg: "#6366f1", size: 28 },
    cable_start: { emoji: "🔌", bg: "#8b5cf6", size: 22 },
    cable_end: { emoji: "⚡", bg: "#6366f1", size: 28 },
    access_road: { emoji: "🛤️", bg: "#64748b", size: 24 },
  };
  const c = cfg[type];
  return L.divIcon({
    className: "",
    iconSize: [c.size, c.size],
    iconAnchor: [c.size / 2, c.size / 2],
    popupAnchor: [0, -c.size / 2],
    html: `<div style="width:${c.size}px;height:${c.size}px;background:${c.bg}20;border:1.5px solid ${c.bg};
      border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:${c.size * 0.45}px;
      box-shadow:0 1px 4px rgba(0,0,0,0.15);">${c.emoji}</div>`,
  });
}

// ─── Map helpers (child components that use useMap hook) ─────────────────────

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
    const pts: L.LatLngExpression[] = [
      ...statuses.map((w) => [w.lat, w.lng] as L.LatLngExpression),
      ...infra.map((p) => [p.lat, p.lng] as L.LatLngExpression),
    ];
    if (pts.length > 0) {
      map.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 15 });
      fitted.current = true;
    }
  }, [map, statuses, infra]);
  return null;
}

function ScrollZoomController({ active }: { active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (active) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [map, active]);
  return null;
}

function ZoomControl() {
  const map = useMap();
  useEffect(() => {
    const ctrl = L.control.zoom({ position: "bottomleft" });
    ctrl.addTo(map);
    return () => {
      ctrl.remove();
    };
  }, [map]);
  return null;
}

function CleanAttribution() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.setPrefix(false);
  }, [map]);
  return null;
}

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
      const g = statuses.filter((s) => s.ampel === "green").length;
      const y = statuses.filter((s) => s.ampel === "yellow").length;
      const r = statuses.filter((s) => s.ampel === "red").length;
      div.innerHTML = `<div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);padding:10px 14px;border-radius:8px;
        box-shadow:0 2px 12px rgba(0,0,0,0.1);font-family:system-ui;font-size:10px;color:#475569;line-height:1.8;border:1px solid #e2e8f0;">
        <div style="font-weight:700;font-size:11px;color:#1e293b;margin-bottom:4px;">${projectName}</div>
        <div style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:#059669;"></span>Secured (${g})</div>
        <div style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:#d97706;"></span>Negotiation (${y})</div>
        <div style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:#dc2626;"></span>Open (${r})</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:3px;padding-top:3px;border-top:1px solid #f1f5f9;">
          <span style="width:8px;height:2px;background:#6366f1;border-radius:1px;"></span>Cable Route
        </div>
      </div>`;
      return div;
    };
    legend.addTo(map);
    return () => {
      legend.remove();
    };
  }, [map, statuses, projectName]);
  return null;
}

// ─── Tile layer config ──────────────────────────────────────────────────────

const TILES = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: "© OpenStreetMap",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri",
  },
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attr: "© OpenTopoMap",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface Props {
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
}: Props) {
  const [mapActive, setMapActive] = useState(false);

  const center: [number, number] = [
    statuses.reduce((s, w) => s + w.lat, 0) / (statuses.length || 1),
    statuses.reduce((s, w) => s + w.lng, 0) / (statuses.length || 1),
  ];

  const cStart = infrastructure.find((p) => p.type === "cable_start");
  const cEnd = infrastructure.find((p) => p.type === "cable_end");
  const cableRoute: [number, number][] =
    cStart && cEnd
      ? [
          [cStart.lat, cStart.lng],
          [cEnd.lat, cEnd.lng],
        ]
      : [];

  const counts = {
    green: statuses.filter((s) => s.ampel === "green").length,
    yellow: statuses.filter((s) => s.ampel === "yellow").length,
    red: statuses.filter((s) => s.ampel === "red").length,
  };

  const handleMouseLeave = useCallback(() => setMapActive(false), []);

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 overflow-hidden",
        className,
      )}
    >
      {/* ── Header ── */}
      <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Project Location Map</span>
          <span className="text-[9px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted font-medium uppercase tracking-wide">
            Interactive
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {counts.green}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {counts.yellow}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {counts.red}
          </span>
          <span className="text-muted-foreground/40">|</span>
          <span>{statuses.length} WEA</span>
        </div>
      </div>

      {/* ── Map ── */}
      <div
        className="relative"
        onClick={() => setMapActive(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Leaflet style overrides — scoped via nesting */}
        <style>{`
          .plm-container .leaflet-control-attribution { font-size: 9px; opacity: 0.6; }
          .plm-container .leaflet-control-attribution a { color: #64748b; }
          .plm-container .leaflet-popup-content-wrapper { border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
          .plm-container .leaflet-popup-content { margin: 10px 12px; }
          .plm-container .leaflet-popup-close-button { font-size: 16px; color: #94a3b8; padding: 6px 8px 0 0; }
          .plm-container .leaflet-control-layers { border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .plm-container .leaflet-control-layers-toggle { width: 32px; height: 32px; background-size: 18px; }
          .plm-container .leaflet-control-zoom a { width: 30px; height: 30px; line-height: 30px; font-size: 14px; color: #475569; }
          .plm-container .leaflet-control-zoom { border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .plm-container .wea-label-tooltip { background: transparent; border: none; box-shadow: none; font-size: 9px; font-weight: 700; color: #1e293b; padding: 0; text-shadow: 0 0 3px #fff, 0 0 3px #fff, 0 0 6px #fff; }
          .plm-container .wea-label-tooltip::before { display: none; }
        `}</style>

        <div className="plm-container">
          <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom={false}
            zoomControl={false}
            style={{ height: "420px", width: "100%" }}
          >
            <CleanAttribution />
            <ScrollZoomController active={mapActive} />
            <FitBounds statuses={statuses} infra={infrastructure} />
            <LegendControl statuses={statuses} projectName={projectName} />
            <ZoomControl />

            <LayersControl position="topright" collapsed={true}>
              <LayersControl.BaseLayer checked name="Street">
                <TileLayer
                  url={TILES.street.url}
                  attribution={TILES.street.attr}
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  url={TILES.satellite.url}
                  attribution={TILES.satellite.attr}
                  maxZoom={18}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Topographic">
                <TileLayer
                  url={TILES.topo.url}
                  attribution={TILES.topo.attr}
                  maxZoom={17}
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {/* Cable route */}
            {cableRoute.length === 2 && (
              <Polyline
                positions={cableRoute}
                pathOptions={{
                  color: "#6366f1",
                  weight: 3,
                  dashArray: "10 6",
                  opacity: 0.75,
                }}
              >
                <Popup>
                  <div style={{ fontFamily: "system-ui", fontSize: "12px" }}>
                    <strong>Cable Route</strong>
                    <br />
                    <span style={{ color: "#64748b" }}>
                      4.2 km → Substation Tostedt
                    </span>
                  </div>
                </Popup>
              </Polyline>
            )}

            {/* Infrastructure */}
            {infrastructure
              .filter((p) => p.type !== "cable_start")
              .map((p) => (
                <Marker
                  key={p.name}
                  position={[p.lat, p.lng]}
                  icon={createInfraIcon(p.type)}
                >
                  <Popup>
                    <div style={{ fontFamily: "system-ui", fontSize: "12px" }}>
                      <strong>{p.name}</strong>
                      <br />
                      <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                        {p.lat.toFixed(5)}°N, {p.lng.toFixed(5)}°E
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* WEA turbines */}
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
                      fontSize: "12px",
                      minWidth: "200px",
                      lineHeight: 1.6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        paddingBottom: "6px",
                        marginBottom: "6px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: AMPEL_HEX[w.ampel],
                          flexShrink: 0,
                        }}
                      />
                      <strong style={{ fontSize: "13px" }}>{w.name}</strong>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "3px",
                          background: `${AMPEL_HEX[w.ampel]}15`,
                          color: AMPEL_HEX[w.ampel],
                        }}
                      >
                        {AMPEL_LABEL[w.ampel]}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#475569" }}>
                      <div>
                        <b style={{ color: "#1e293b" }}>Owner:</b> {w.owner}
                      </div>
                      <div>
                        <b style={{ color: "#1e293b" }}>Parcel:</b> {w.parcel}
                      </div>
                      <div>
                        <b style={{ color: "#1e293b" }}>Address:</b> {w.address}
                      </div>
                      <div>
                        <b style={{ color: "#1e293b" }}>Contract:</b>{" "}
                        {w.contract}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "5px",
                        paddingTop: "5px",
                        borderTop: "1px solid #f1f5f9",
                        fontSize: "10px",
                        color: "#94a3b8",
                      }}
                    >
                      {w.lat.toFixed(5)}°N, {w.lng.toFixed(5)}°E
                    </div>
                  </div>
                </Popup>
                <LeafletTooltip
                  direction="top"
                  offset={[0, -16]}
                  permanent
                  className="wea-label-tooltip"
                >
                  {w.name}
                </LeafletTooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* "Click to interact" overlay */}
        {!mapActive && (
          <div className="absolute inset-0 z-[1000] flex items-end justify-center pb-4 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              Click to enable zoom & pan
            </div>
          </div>
        )}
      </div>

      {/* ── Coordinates ── */}
      <div className="border-t border-border/40">
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Coordinates
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
            {statuses.map((w) => (
              <div
                key={w.name}
                className="flex items-center gap-1.5 text-[11px]"
              >
                <span
                  className={cn("w-1.5 h-1.5 rounded-full", AMPEL_BG[w.ampel])}
                />
                <span className="font-medium">{w.name}</span>
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
