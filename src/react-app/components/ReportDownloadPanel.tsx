"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Progress } from "@/react-app/components/ui/progress";
// import { ScrollArea } from "@/react-app/components/ui/scroll-area";
// import { Separator } from "@/react-app/components/ui/separator";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/react-app/components/ui/dialog";
import { cn } from "@/react-app/lib/utils";
import {
  DownloadIcon,
  ManuscriptIcon,
  CheckIcon,
  CheckRingIcon,
  // AlertIcon,
  // DangerRingIcon,
  SandglassIcon,
  DotsVerticalIcon,
  ArrowRightIcon,
  ShieldColumnIcon,
  // SignalTowerIcon,
  // TrendUpIcon,
  LensIcon,
  // GearIcon,
  CalendarIcon,
  ArchiveIcon,
  SearchIcon,
  FilterIcon,
  // EditIcon,
  // StorageIcon,
} from "@/react-app/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  // DropdownMenuSeparator,
} from "@/react-app/components/ui/dropdown-menu";
import {
  // Tooltip,
  // TooltipContent,
  // TooltipProvider,
  // TooltipTrigger,
} from "@/react-app/components/ui/tooltip";
import { Input } from "@/react-app/components/ui/input";

// ═══════════════════════════════════════════════════════════════════════════════
// DATA MODEL
// ═══════════════════════════════════════════════════════════════════════════════

export interface DocumentItem {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  type: string;
  status: "analyzed" | "pending" | "archived";
  category: string;
}

type Ampel = "green" | "yellow" | "red";

interface AusgabeblattRow {
  label: string;
  value: string;
  ampel?: Ampel;
  note?: string;
}

interface AusgabeblattSection {
  id: string;
  title: string;
  rows: AusgabeblattRow[];
}

interface WEAStatus {
  name: string;
  ampel: Ampel;
  owner: string;
  parcel: string;
  contract: string;
}

interface DDiQReportData {
  projectName: string;
  preparedBy: string;
  preparedFor: string;
  date: string;
  sections: AusgabeblattSection[];
  weaStatuses: WEAStatus[];
  findings: { domain: string; severity: Ampel; text: string }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO DATA — Windpark Nordheide
// ═══════════════════════════════════════════════════════════════════════════════

const DEMO_REPORT: DDiQReportData = {
  projectName: "Windpark Nordheide",
  preparedBy: "LAI Due Diligence System",
  preparedFor: "Nordheide Invest GmbH & Co. KG",
  date: new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }),
  sections: [
    {
      id: "overview",
      title: "Project Overview",
      rows: [
        { label: "Project Name", value: "Windpark Nordheide" },
        {
          label: "Location",
          value: "District of Harburg, Lower Saxony, Germany",
        },
        {
          label: "Project Status",
          value: "Under Permit Review (BImSchG application filed)",
        },
        { label: "Project Type", value: "Greenfield" },
        { label: "Number of WEA", value: "8 Wind Turbines" },
        { label: "Type & Capacity", value: "Vestas V162 – 6.2 MW per unit" },
        { label: "Total Capacity", value: "49.6 MW" },
        { label: "Project Company", value: "Nordheide Wind GmbH" },
        {
          label: "Investors",
          value: "Nordheide Invest GmbH & Co. KG, HansaWind AG",
        },
        {
          label: "Grid Connection",
          value: "Substation Tostedt, 4.2 km cable route",
        },
        {
          label: "Wind Priority Zone",
          value: "Yes – per Regional Plan (RROP) Harburg District 2021",
        },
      ],
    },
    {
      id: "land",
      title: "Land Security & Ownership",
      rows: [
        {
          label: "Usage Contracts",
          value: "6 of 8 locations contractually secured (75%)",
          ampel: "yellow",
        },
        {
          label: "Land Registry",
          value: "4 easements registered (50%)",
          ampel: "yellow",
        },
        {
          label: "Buffer Zone Security",
          value: "Partially secured – 2 areas open",
          ampel: "yellow",
        },
        {
          label: "Cable Route",
          value: "100% secured – agreement with municipality of Tostedt",
          ampel: "green",
        },
        { label: "Access Roads", value: "100% secured", ampel: "green" },
        {
          label: "Contract Error Rate",
          value:
            "2 contracts with missing signatures, 1 with inconsistent parcel designation",
          ampel: "red",
          note: "Renegotiation required for 3 contracts",
        },
        {
          label: "Contracts Reviewed",
          value: "12 contracts reviewed (8 usage, 2 cable, 2 access)",
        },
        {
          label: "Contracting Entity",
          value: "All contracts with Nordheide Wind GmbH – consistent",
          ampel: "green",
        },
      ],
    },
    {
      id: "permits",
      title: "Permits & Regulatory Conditions",
      rows: [
        {
          label: "BImSchG Permit",
          value: "Applied on Sep 12, 2024 – decision pending",
          ampel: "yellow",
        },
        {
          label: "Environmental Impact Assessment",
          value: "Completed – no objections raised",
          ampel: "green",
        },
        {
          label: "Species Protection",
          value: "Red kite shutdown periods required (Apr–Aug)",
          ampel: "yellow",
          note: "Expert report by BioConsult 2024 available",
        },
        {
          label: "Noise & Shadow",
          value: "Conditions met – assessment by CUBE Engineering",
          ampel: "green",
        },
        {
          label: "Public Authority Consultations",
          value:
            "12 authorities consulted, 11 no objections, 1 follow-up (heritage protection)",
          ampel: "yellow",
        },
        {
          label: "Recurring Inspections",
          value: "Not applicable (new installation)",
          ampel: "green",
        },
      ],
    },
    {
      id: "economics",
      title: "Economics & Operations",
      rows: [
        {
          label: "Feed-in Tariff",
          value: "EEG 2023 – awarded tariff: 7.35 ct/kWh",
          ampel: "green",
        },
        {
          label: "Direct Marketing / PPA",
          value: "PPA with EnBW until 2040, 8.1 ct/kWh (Cap & Floor)",
          ampel: "green",
        },
        {
          label: "Profitability",
          value: "IRR 7.2% at P75 – bankable",
          ampel: "green",
        },
        {
          label: "Project Financing",
          value: "KfW IPEX + NordLB, term sheet signed",
          ampel: "green",
        },
        {
          label: "Securities",
          value: "Land charges registered, bank guarantee €2.4M",
          ampel: "green",
        },
        {
          label: "Operations Management",
          value: "Deutsche Windtechnik AG (technical + commercial)",
          ampel: "green",
        },
        {
          label: "Maintenance",
          value:
            "Full-service contract with Vestas (15 years), 97% availability guarantee",
          ampel: "green",
        },
        {
          label: "Insurance",
          value: "Allianz Wind Energy Policy, incl. revenue loss insurance",
          ampel: "green",
        },
        { label: "Open Liability Issues", value: "None known", ampel: "green" },
      ],
    },
  ],
  weaStatuses: [
    {
      name: "WEA 1",
      ampel: "green",
      owner: "Hofmann, Heinrich",
      parcel: "Plot 12/4",
      contract: "UC-2024-001, signed",
    },
    {
      name: "WEA 2",
      ampel: "green",
      owner: "Meier, Anna",
      parcel: "Plot 12/7",
      contract: "UC-2024-002, signed",
    },
    {
      name: "WEA 3",
      ampel: "green",
      owner: "Municipality of Tostedt",
      parcel: "Plot 14/1",
      contract: "UC-2024-003, signed",
    },
    {
      name: "WEA 4",
      ampel: "green",
      owner: "Kroeger, Thomas",
      parcel: "Plot 15/2",
      contract: "UC-2024-004, signed",
    },
    {
      name: "WEA 5",
      ampel: "green",
      owner: "Lueders, Karin",
      parcel: "Plot 15/8",
      contract: "UC-2024-005, signed",
    },
    {
      name: "WEA 6",
      ampel: "yellow",
      owner: "Schmidt Estate (heirs)",
      parcel: "Plot 16/3",
      contract: "Draft sent, awaiting response",
    },
    {
      name: "WEA 7",
      ampel: "yellow",
      owner: "Petersen, Jens",
      parcel: "Plot 17/1",
      contract: "Under negotiation – fee dispute",
    },
    {
      name: "WEA 8",
      ampel: "red",
      owner: "Unknown (heir investigation)",
      parcel: "Plot 18/5",
      contract: "No contract – owner unidentified",
    },
  ],
  findings: [
    {
      domain: "Land Security",
      severity: "red",
      text: "WEA 8 (Plot 18/5): Owner not identified. Heir investigation via probate court recommended.",
    },
    {
      domain: "Land Security",
      severity: "red",
      text: "3 usage contracts have defects: missing signatures (2x), inconsistent parcel ID (1x).",
    },
    {
      domain: "Land Security",
      severity: "yellow",
      text: "WEA 6 & 7: Contract signing pending. Deadline of Q1 2025 recommended.",
    },
    {
      domain: "Permits",
      severity: "yellow",
      text: "BImSchG decision still outstanding. Permit expected Q2 2025.",
    },
    {
      domain: "Permits",
      severity: "yellow",
      text: "Heritage protection: Follow-up request from Lower Heritage Authority regarding sightline assessment.",
    },
    {
      domain: "Permits",
      severity: "yellow",
      text: "Red kite shutdown periods reduce expected yield by approx. 1.8%.",
    },
    {
      domain: "Economics",
      severity: "green",
      text: "Financing secured, PPA long-term, maintenance fully covered.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

interface ReportPreset {
  id: string;
  name: string;
  description: string;
  sections: string[];
  estimatedPages: string;
}

const PRESETS: ReportPreset[] = [
  {
    id: "full",
    name: "Full DDiQ Report",
    description:
      "All output tables, land security status map, and action items",
    sections: [
      "overview",
      "land",
      "permits",
      "economics",
      "statusmap",
      "findings",
    ],
    estimatedPages: "12–18",
  },
  {
    id: "executive",
    name: "Executive Summary",
    description: "Project overview, risk summary, and status map",
    sections: ["overview", "statusmap", "findings"],
    estimatedPages: "4–6",
  },
  {
    id: "land",
    name: "Land Security Audit",
    description:
      "Contract review, land registry, status map with traffic-light",
    sections: ["overview", "land", "statusmap", "findings"],
    estimatedPages: "8–10",
  },
  {
    id: "permit",
    name: "Permit & Compliance Check",
    description: "BImSchG, environmental conditions, authority consultations",
    sections: ["overview", "permits", "findings"],
    estimatedPages: "6–8",
  },
  {
    id: "economics",
    name: "Economic & Contractual Review",
    description: "EEG/PPA, financing, operations, maintenance, insurance",
    sections: ["overview", "economics", "findings"],
    estimatedPages: "6–8",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT FORMATS
// ═══════════════════════════════════════════════════════════════════════════════

type ExportFormat = "pdf" | "docx" | "html" | "xlsx" | "csv" | "txt";

interface FormatOption {
  id: ExportFormat;
  label: string;
  description: string;
  colorCls: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "pdf",
    label: "PDF",
    description: "Print-ready, fixed layout",
    colorCls:
      "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
  {
    id: "docx",
    label: "DOCX",
    description: "Editable Word document",
    colorCls:
      "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "html",
    label: "HTML",
    description: "Interactive, shareable online",
    colorCls:
      "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/30",
  },
  {
    id: "xlsx",
    label: "XLSX",
    description: "Spreadsheet for data analysis",
    colorCls:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "csv",
    label: "CSV",
    description: "Plain data, any tool compatible",
    colorCls:
      "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "txt",
    label: "TXT",
    description: "Plain text, lightweight",
    colorCls:
      "text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/30",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const AmpelDot = ({
  status,
  size = "sm",
}: {
  status: Ampel;
  size?: "sm" | "md";
}) => {
  const s = size === "md" ? "w-3 h-3" : "w-2 h-2";
  const c = {
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    red: "bg-rose-500",
  };
  return (
    <span
      className={cn("inline-block rounded-full flex-shrink-0", s, c[status])}
    />
  );
};

const AmpelBadge = ({ status }: { status: Ampel }) => {
  const cfg = {
    green: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      label: "Secured",
    },
    yellow: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-400",
      label: "Partial",
    },
    red: {
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-700 dark:text-rose-400",
      label: "Open",
    },
  };
  const c = cfg[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium",
        c.bg,
        c.text,
      )}
    >
      <AmpelDot status={status} />
      {c.label}
    </span>
  );
};

const AusgabeblattTable = ({ section }: { section: AusgabeblattSection }) => (
  <div className="rounded-lg border border-border/60 overflow-hidden">
    <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 border-b border-border/40">
      <h4 className="text-sm font-semibold">{section.title}</h4>
    </div>
    <div className="divide-y divide-border/30">
      {section.rows.map((row, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground font-medium min-w-[200px] flex-shrink-0">
            {row.label}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              {row.ampel && <AmpelDot status={row.ampel} size="md" />}
              <span>{row.value}</span>
            </div>
            {row.note && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                {row.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatusMap = ({ statuses }: { statuses: WEAStatus[] }) => {
  const c = {
    green: statuses.filter((s) => s.ampel === "green").length,
    yellow: statuses.filter((s) => s.ampel === "yellow").length,
    red: statuses.filter((s) => s.ampel === "red").length,
  };
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 border-b border-border/40">
        <h4 className="text-sm font-semibold">Land Security Status Map</h4>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-6 mb-4 text-xs">
          <span className="flex items-center gap-1.5">
            <AmpelDot status="green" size="md" />
            Fully Secured ({c.green})
          </span>
          <span className="flex items-center gap-1.5">
            <AmpelDot status="yellow" size="md" />
            In Negotiation ({c.yellow})
          </span>
          <span className="flex items-center gap-1.5">
            <AmpelDot status="red" size="md" />
            Open Issues ({c.red})
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {statuses.map((w) => {
            const bc = {
              green: "border-emerald-500/40",
              yellow: "border-amber-500/40",
              red: "border-rose-500/40",
            }[w.ampel];
            const bg = {
              green: "bg-emerald-500/5",
              yellow: "bg-amber-500/5",
              red: "bg-rose-500/5",
            }[w.ampel];
            return (
              <div key={w.name} className={cn("p-3 rounded-md border", bc, bg)}>
                <div className="flex items-center gap-2 mb-1">
                  <AmpelDot status={w.ampel} size="md" />
                  <span className="text-sm font-semibold">{w.name}</span>
                  <AmpelBadge status={w.ampel} />
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5 ml-5">
                  <p>Owner: {w.owner}</p>
                  <p>Parcel: {w.parcel}</p>
                  <p>Contract: {w.contract}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FindingsTable = ({
  findings,
}: {
  findings: DDiQReportData["findings"];
}) => (
  <div className="rounded-lg border border-border/60 overflow-hidden">
    <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 border-b border-border/40">
      <h4 className="text-sm font-semibold">Action Items & Open Issues</h4>
    </div>
    <div className="divide-y divide-border/30">
      {findings.map((f, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3">
          <AmpelDot status={f.severity} size="md" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground">
              {f.domain}
            </span>
            <p className="text-sm mt-0.5">{f.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT GENERATORS (per format)
// ═══════════════════════════════════════════════════════════════════════════════

function generateHTML(data: DDiQReportData, active: string[]): string {
  const secs = data.sections.filter((s) => active.includes(s.id));
  const ampelC = (a: Ampel) =>
    ({ green: "#059669", yellow: "#d97706", red: "#dc2626" })[a];
  const ampelL = (a: Ampel) =>
    ({ green: "Secured", yellow: "Partial", red: "Open" })[a];

  const secHTML = secs
    .map(
      (sec) => `
    <h2 style="font-size:15px;font-weight:700;margin:28px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">${sec.title}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#f8fafc;"><th style="text-align:left;padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;width:220px;">Category</th><th style="text-align:left;padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;">Status / Details</th></tr></thead>
      <tbody>${sec.rows.map((r) => `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:500;vertical-align:top;">${r.label}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;vertical-align:top;">${r.ampel ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ampelC(r.ampel)};margin-right:6px;vertical-align:middle;"></span>` : ""}${r.value}${r.note ? `<br/><em style="color:#d97706;font-size:12px;">${r.note}</em>` : ""}</td></tr>`).join("")}</tbody>
    </table>`,
    )
    .join("");

  const mapHTML = active.includes("statusmap")
    ? `
    <h2 style="font-size:15px;font-weight:700;margin:28px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">Land Security Status Map</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#f8fafc;"><th style="padding:8px 12px;border:1px solid #e2e8f0;">WEA</th><th style="padding:8px 12px;border:1px solid #e2e8f0;">Status</th><th style="padding:8px 12px;border:1px solid #e2e8f0;">Owner</th><th style="padding:8px 12px;border:1px solid #e2e8f0;">Parcel</th><th style="padding:8px 12px;border:1px solid #e2e8f0;">Contract</th></tr></thead>
      <tbody>${data.weaStatuses.map((w) => `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;">${w.name}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ampelC(w.ampel)};margin-right:6px;vertical-align:middle;"></span>${ampelL(w.ampel)}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${w.owner}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${w.parcel}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${w.contract}</td></tr>`).join("")}</tbody></table>`
    : "";

  const findHTML = active.includes("findings")
    ? `
    <h2 style="font-size:15px;font-weight:700;margin:28px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">Action Items & Recommendations</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#f8fafc;"><th style="width:24px;border:1px solid #e2e8f0;padding:8px;"></th><th style="text-align:left;padding:8px 12px;border:1px solid #e2e8f0;width:140px;">Domain</th><th style="text-align:left;padding:8px 12px;border:1px solid #e2e8f0;">Recommendation</th></tr></thead>
      <tbody>${data.findings.map((f) => `<tr><td style="text-align:center;padding:8px;border:1px solid #e2e8f0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ampelC(f.severity)};"></span></td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:500;">${f.domain}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${f.text}</td></tr>`).join("")}</tbody></table>`
    : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>DDiQ Report – ${data.projectName}</title><style>@media print{body{font-size:12px}h1{font-size:18px}h2{font-size:14px}table{page-break-inside:avoid}}</style></head>
<body style="max-width:900px;margin:40px auto;padding:0 24px;font-family:system-ui,-apple-system,sans-serif;color:#1e293b;line-height:1.5;">
<div style="border-bottom:3px solid #1e293b;padding-bottom:16px;margin-bottom:32px;">
<h1 style="font-size:22px;font-weight:800;margin:0;">DDiQ Due Diligence Report</h1>
<p style="font-size:18px;font-weight:600;color:#475569;margin:4px 0 0;">${data.projectName}</p>
<div style="display:flex;gap:24px;margin-top:12px;font-size:12px;color:#64748b;"><span>Prepared for: ${data.preparedFor}</span><span>By: ${data.preparedBy}</span><span>Date: ${data.date}</span></div>
</div>${secHTML}${mapHTML}${findHTML}
<div style="margin-top:40px;padding-top:16px;border-top:2px solid #e2e8f0;font-size:11px;color:#94a3b8;">
<p>This report was auto-generated by the LAI Due Diligence System based on the DDiQ v1 framework. Contents do not substitute individual legal or financial review.</p>
</div></body></html>`;
}

function generateCSV(data: DDiQReportData, active: string[]): string {
  const lines: string[] = ["Section,Category,Value,Status"];
  data.sections
    .filter((s) => active.includes(s.id))
    .forEach((sec) => {
      sec.rows.forEach((r) => {
        lines.push(
          `"${sec.title}","${r.label}","${r.value.replace(/"/g, '""')}","${r.ampel || ""}"`,
        );
      });
    });
  if (active.includes("statusmap")) {
    data.weaStatuses.forEach((w) => {
      lines.push(
        `"Land Security Map","${w.name}","Owner: ${w.owner} | Parcel: ${w.parcel} | Contract: ${w.contract}","${w.ampel}"`,
      );
    });
  }
  if (active.includes("findings")) {
    data.findings.forEach((f) => {
      lines.push(
        `"Action Items","${f.domain}","${f.text.replace(/"/g, '""')}","${f.severity}"`,
      );
    });
  }
  return lines.join("\n");
}

function generateTXT(data: DDiQReportData, active: string[]): string {
  const sep = "=".repeat(72);
  const lines: string[] = [
    sep,
    `  DDiQ Due Diligence Report`,
    `  ${data.projectName}`,
    sep,
    "",
    `  Prepared for: ${data.preparedFor}`,
    `  By: ${data.preparedBy}`,
    `  Date: ${data.date}`,
    "",
  ];
  data.sections
    .filter((s) => active.includes(s.id))
    .forEach((sec) => {
      lines.push(
        "",
        `----- ${sec.title.toUpperCase()} ${"─".repeat(Math.max(0, 60 - sec.title.length))}`,
        "",
      );
      sec.rows.forEach((r) => {
        const status = r.ampel ? ` [${r.ampel.toUpperCase()}]` : "";
        lines.push(`  ${r.label.padEnd(30)} ${r.value}${status}`);
        if (r.note) lines.push(`  ${"".padEnd(30)} >> ${r.note}`);
      });
    });
  if (active.includes("statusmap")) {
    lines.push(
      "",
      "----- LAND SECURITY STATUS MAP ────────────────────────────────────",
      "",
    );
    data.weaStatuses.forEach((w) => {
      lines.push(
        `  [${w.ampel.toUpperCase().padEnd(6)}] ${w.name}  |  ${w.owner}  |  ${w.parcel}  |  ${w.contract}`,
      );
    });
  }
  if (active.includes("findings")) {
    lines.push(
      "",
      "----- ACTION ITEMS & RECOMMENDATIONS ──────────────────────────────",
      "",
    );
    data.findings.forEach((f, i) => {
      lines.push(
        `  ${i + 1}. [${f.severity.toUpperCase()}] ${f.domain}: ${f.text}`,
      );
    });
  }
  lines.push(
    "",
    sep,
    "  Auto-generated by LAI Due Diligence System · DDiQ v1",
    sep,
  );
  return lines.join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function downloadFormat(
  format: ExportFormat,
  data: DDiQReportData,
  active: string[],
) {
  const stem = `DDiQ_${data.projectName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`;
  switch (format) {
    case "html":
      return downloadFile(
        generateHTML(data, active),
        `${stem}.html`,
        "text/html;charset=utf-8",
      );
    case "csv":
      return downloadFile(
        generateCSV(data, active),
        `${stem}.csv`,
        "text/csv;charset=utf-8",
      );
    case "txt":
      return downloadFile(
        generateTXT(data, active),
        `${stem}.txt`,
        "text/plain;charset=utf-8",
      );
    case "pdf":
      return downloadFile(
        generateHTML(data, active),
        `${stem}.html`,
        "text/html;charset=utf-8",
      ); // Open HTML → Print to PDF
    case "docx":
      return downloadFile(
        generateHTML(data, active),
        `${stem}.doc`,
        "application/msword",
      ); // Basic .doc from HTML
    case "xlsx":
      return downloadFile(
        generateCSV(data, active),
        `${stem}.csv`,
        "text/csv;charset=utf-8",
      ); // CSV importable to Excel
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface Props {
  documents: DocumentItem[];
  className?: string;
}
type Step = "list" | "configure" | "preview" | "exporting";

export default function ReportDownloadPanel({ documents, className }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("list");
  const [targetDocId, setTargetDocId] = useState<string | "all">("all");
  const [selectedPreset, setSelectedPreset] = useState<ReportPreset>(
    PRESETS[0],
  );
  const [activeSections, setActiveSections] = useState<string[]>(
    PRESETS[0].sections,
  );
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>([
    "pdf",
  ]);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportDone, setExportDone] = useState(false);

  const analyzedDocs = useMemo(
    () => documents.filter((d) => d.status === "analyzed"),
    [documents],
  );
  const filteredDocs = useMemo(
    () =>
      documents.filter((d) => {
        const ms =
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.category.toLowerCase().includes(searchTerm.toLowerCase());
        return ms && (!filterStatus || d.status === filterStatus);
      }),
    [documents, searchTerm, filterStatus],
  );

  const targetLabel =
    targetDocId === "all"
      ? `All Documents (${analyzedDocs.length})`
      : documents.find((d) => d.id === targetDocId)?.name || "Document";

  const openWizard = (target: string | "all", presetId?: string) => {
    setTargetDocId(target);
    const preset = presetId
      ? PRESETS.find((p) => p.id === presetId) || PRESETS[0]
      : PRESETS[0];
    setSelectedPreset(preset);
    setActiveSections([...preset.sections]);
    setSelectedFormats(["pdf"]);
    setExportProgress(0);
    setExportDone(false);
    setStep("configure");
  };

  const pickPreset = (p: ReportPreset) => {
    setSelectedPreset(p);
    setActiveSections([...p.sections]);
  };
  const toggleSection = (id: string) =>
    setActiveSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  const toggleFormat = (id: ExportFormat) =>
    setSelectedFormats((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((f) => f !== id)
          : prev
        : [...prev, id],
    );
  const resetToList = () => {
    setStep("list");
    setExportDone(false);
  };

  const doExport = () => {
    setStep("exporting");
    setExportProgress(0);
    setExportDone(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 20 + 8;
      if (p >= 100) {
        clearInterval(iv);
        setExportProgress(100);
        setExportDone(true);
      } else setExportProgress(Math.min(p, 98));
    }, 300);
  };

  const handleDownloadAll = () => {
    selectedFormats.forEach((fmt) =>
      downloadFormat(fmt, DEMO_REPORT, activeSections),
    );
  };
  const handleDownloadOne = (fmt: ExportFormat) => {
    downloadFormat(fmt, DEMO_REPORT, activeSections);
  };

  const statusCfg = {
    analyzed: {
      Icon: CheckRingIcon,
      color: "text-emerald-600 dark:text-emerald-500",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      label: "Analyzed",
    },
    pending: {
      Icon: SandglassIcon,
      color: "text-amber-600 dark:text-amber-500",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      label: "Pending",
    },
    archived: {
      Icon: ArchiveIcon,
      color: "text-slate-500 dark:text-slate-400",
      bg: "bg-slate-500/10 dark:bg-slate-500/20",
      label: "Archived",
    },
  };

  const sectionMeta = [
    {
      id: "overview",
      label: "Project Overview",
      desc: "Name, location, WEA specs, companies",
    },
    {
      id: "land",
      label: "Land Security & Ownership",
      desc: "Contracts, land registry, error rate",
    },
    {
      id: "permits",
      label: "Permits & Conditions",
      desc: "BImSchG, EIA, species protection, inspections",
    },
    {
      id: "economics",
      label: "Economics & Operations",
      desc: "EEG, PPA, financing, maintenance, insurance",
    },
    {
      id: "statusmap",
      label: "Status Map (Traffic Light)",
      desc: "Green / Yellow / Red per WEA and parcel",
    },
    {
      id: "findings",
      label: "Action Items & Recommendations",
      desc: "Prioritized open issues and risks",
    },
  ];

  // ═════════ STEP: LIST ═════════════════════════════════════════════════════

  if (step === "list")
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">DDiQ Report Builder</h2>
            <p className="text-sm text-muted-foreground">
              Generate due diligence reports based on the DDiQ framework
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => openWizard("all")}
            disabled={analyzedDocs.length === 0}
            className="shadow-sm"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Full DDiQ Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Documents",
              value: documents.length,
              sub: "Uploaded",
              Icon: ManuscriptIcon,
              bCls: "",
            },
            {
              label: "Report Ready",
              value: analyzedDocs.length,
              sub: "Analyzed",
              Icon: CheckRingIcon,
              bCls: "border-l-4 border-l-emerald-500/50",
              vCls: "text-emerald-600 dark:text-emerald-500",
            },
            {
              label: "DDiQ Domains",
              value: "5",
              sub: "59 review questions",
              Icon: ShieldColumnIcon,
              bCls: "border-l-4 border-l-blue-500/50",
              vCls: "text-blue-600 dark:text-blue-500",
            },
          ].map((s) => (
            <Card
              key={s.label}
              className={cn(
                "bg-card/50 backdrop-blur border-border/50",
                s.bCls,
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p
                      className={cn("text-2xl font-bold mt-2", (s as any).vCls)}
                    >
                      {s.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.sub}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-md bg-slate-100 dark:bg-slate-800">
                    <s.Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FilterIcon className="w-4 h-4 mr-2" />
                {filterStatus
                  ? filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)
                  : "All"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("analyzed")}>
                Analyzed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("archived")}>
                Archived
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ManuscriptIcon className="w-5 h-5" />
              Documents ({filteredDocs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-12">
                <ManuscriptIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">
                  No documents found
                </p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const sc = statusCfg[doc.status];
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={cn(
                          "p-2 rounded-lg flex-shrink-0 border border-border/50",
                          sc.bg,
                        )}
                      >
                        <sc.Icon className={cn("w-5 h-5", sc.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{doc.name}</p>
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-md",
                              sc.bg,
                              sc.color,
                            )}
                          >
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{doc.size.toFixed(1)} MB</span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {doc.uploadDate}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                            {doc.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={doc.status !== "analyzed"}
                        onClick={() => openWizard(doc.id)}
                        className="h-8 shadow-sm"
                      >
                        <DownloadIcon className="w-3.5 h-3.5 mr-1.5" />
                        DDiQ Report
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={doc.status !== "analyzed"}
                          >
                            <DotsVerticalIcon className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {PRESETS.map((p) => (
                            <DropdownMenuItem
                              key={p.id}
                              onClick={() => openWizard(doc.id, p.id)}
                            >
                              <ArrowRightIcon className="w-4 h-4 mr-2" />
                              {p.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    );

  // ═════════ STEP: CONFIGURE ════════════════════════════════════════════════

  if (step === "configure")
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToList}
            className="text-xs h-7 px-2"
          >
            ← Back
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Configure Report</h2>
            <p className="text-sm text-muted-foreground">
              Target: {targetLabel}
            </p>
          </div>
        </div>

        {/* Presets */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Report Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickPreset(p)}
                  className={cn(
                    "text-left p-3 rounded-lg border transition-all",
                    selectedPreset.id === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {selectedPreset.id === p.id && (
                      <CheckIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    )}
                    <span className="text-sm font-semibold">{p.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                  <Badge variant="outline" className="text-[9px] mt-2">
                    ~{p.estimatedPages} pages
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Customize Sections ({activeSections.length}/6)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sectionMeta.map((sm) => {
              const active = activeSections.includes(sm.id);
              return (
                <div
                  key={sm.id}
                  onClick={() => toggleSection(sm.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all",
                    active
                      ? "border-primary/30 bg-primary/5"
                      : "border-transparent hover:bg-muted/40",
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                      active ? "bg-primary border-primary" : "border-border",
                    )}
                  >
                    {active && (
                      <CheckIcon className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        !active && "text-muted-foreground",
                      )}
                    >
                      {sm.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {sm.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Export Formats */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Export Formats (select one or more)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map((fmt) => {
                const active = selectedFormats.includes(fmt.id);
                return (
                  <div
                    key={fmt.id}
                    onClick={() => toggleFormat(fmt.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all",
                      active
                        ? `${fmt.colorCls} border`
                        : "border-border/50 hover:bg-muted/40",
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                        active ? "bg-primary border-primary" : "border-border",
                      )}
                    >
                      {active && (
                        <CheckIcon className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          !active && "text-muted-foreground",
                        )}
                      >
                        .{fmt.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {fmt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              PDF & DOCX export as printable HTML. XLSX exports as CSV
              importable to Excel. All formats download instantly.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={resetToList}>
            Cancel
          </Button>
          <Button
            onClick={() => setStep("preview")}
            disabled={activeSections.length === 0}
            className="shadow-sm"
          >
            <LensIcon className="w-4 h-4 mr-2" />
            Preview Report
          </Button>
        </div>
      </div>
    );

  // ═════════ STEP: PREVIEW ══════════════════════════════════════════════════

  if (step === "preview") {
    const visSec = DEMO_REPORT.sections.filter((s) =>
      activeSections.includes(s.id),
    );
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("configure")}
              className="text-xs h-7 px-2"
            >
              ← Configure
            </Button>
            <div>
              <h2 className="text-lg font-semibold">Report Preview</h2>
              <p className="text-sm text-muted-foreground">
                {selectedPreset.name} — {targetLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2">
              {selectedFormats.map((f) => {
                const fo = FORMAT_OPTIONS.find((x) => x.id === f);
                return (
                  <span
                    key={f}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-semibold border",
                      fo?.colorCls,
                    )}
                  >
                    .{f.toUpperCase()}
                  </span>
                );
              })}
            </div>
            <Button onClick={doExport} className="shadow-sm">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 p-6 bg-card">
          <div className="border-b-2 border-foreground pb-4 mb-4">
            <h1 className="text-xl font-bold">DDiQ Due Diligence Report</h1>
            <p className="text-lg font-semibold text-muted-foreground mt-1">
              {DEMO_REPORT.projectName}
            </p>
            <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
              <span>Prepared for: {DEMO_REPORT.preparedFor}</span>
              <span>By: {DEMO_REPORT.preparedBy}</span>
              <span>Date: {DEMO_REPORT.date}</span>
            </div>
          </div>
          <div className="space-y-6">
            {visSec.map((sec) => (
              <AusgabeblattTable key={sec.id} section={sec} />
            ))}
            {activeSections.includes("statusmap") && (
              <StatusMap statuses={DEMO_REPORT.weaStatuses} />
            )}
            {activeSections.includes("findings") && (
              <FindingsTable findings={DEMO_REPORT.findings} />
            )}
          </div>
          <div className="mt-8 pt-4 border-t border-border/40 text-[11px] text-muted-foreground">
            This report was auto-generated by the LAI Due Diligence System based
            on the DDiQ v1 framework. Contents do not substitute individual
            legal or financial review.
          </div>
        </div>
      </div>
    );
  }

  // ═════════ STEP: EXPORTING ════════════════════════════════════════════════

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep("preview")}
          disabled={!exportDone}
          className="text-xs h-7 px-2"
        >
          ← Preview
        </Button>
        <div>
          <h2 className="text-lg font-semibold">
            {exportDone ? "Report Ready" : "Generating Report..."}
          </h2>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="py-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            {!exportDone ? (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <SandglassIcon className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">
                    Generating DDiQ report...
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPreset.name} · {activeSections.length} sections ·{" "}
                    {selectedFormats.map((f) => f.toUpperCase()).join(", ")}
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Progress</span>
                    <span>{Math.round(exportProgress)}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckRingIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">
                    Report generated successfully
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {DEMO_REPORT.projectName} — {selectedPreset.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeSections.length} sections ·{" "}
                    {DEMO_REPORT.weaStatuses.length} WEA locations ·{" "}
                    {DEMO_REPORT.findings.length} action items
                  </p>
                </div>

                {/* Download all */}
                {selectedFormats.length > 1 && (
                  <Button onClick={handleDownloadAll} className="shadow-sm">
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download All ({selectedFormats.length} files)
                  </Button>
                )}

                {/* Individual format buttons */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {selectedFormats.map((fmt) => {
                    const fo = FORMAT_OPTIONS.find((x) => x.id === fmt)!;
                    return (
                      <button
                        key={fmt}
                        onClick={() => handleDownloadOne(fmt)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity",
                          fo.colorCls,
                        )}
                      >
                        <DownloadIcon className="w-3.5 h-3.5" />.
                        {fmt.toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <Button variant="outline" size="sm" onClick={resetToList}>
                    Back to Overview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep("configure")}
                  >
                    Generate Another
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
