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
import { Separator } from "@/react-app/components/ui/separator";
import { cn } from "@/react-app/lib/utils";
import {
  DownloadIcon,
  ManuscriptIcon,
  CheckIcon,
  CheckRingIcon,
  SandglassIcon,
  ArrowRightIcon,
  LensIcon,
  ArchiveIcon,
  SearchIcon,
} from "@/react-app/components/icons";
import { Input } from "@/react-app/components/ui/input";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

// Matches the Document type in DashboardDocumentsPage exactly
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
  analyzedDocuments: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO DATA
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
  analyzedDocuments: [],
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
          value: "Yes – per Regional Plan (RROP) Harburg 2021",
        },
      ],
    },
    {
      id: "land",
      title: "Land Security & Ownership",
      rows: [
        {
          label: "Usage Contracts",
          value: "6 of 8 locations secured (75%)",
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
          value: "2 contracts with missing signatures, 1 inconsistent parcel",
          ampel: "red",
          note: "Renegotiation required for 3 contracts",
        },
        {
          label: "Contracts Reviewed",
          value: "12 contracts (8 usage, 2 cable, 2 access)",
        },
        {
          label: "Contracting Entity",
          value: "All with Nordheide Wind GmbH – consistent",
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
          value: "Applied Sep 12, 2024 – decision pending",
          ampel: "yellow",
        },
        {
          label: "Environmental Impact",
          value: "EIA completed – no objections",
          ampel: "green",
        },
        {
          label: "Species Protection",
          value: "Red kite shutdown required (Apr–Aug)",
          ampel: "yellow",
          note: "BioConsult 2024 report available",
        },
        {
          label: "Noise & Shadow",
          value: "Conditions met – CUBE Engineering",
          ampel: "green",
        },
        {
          label: "Authority Consultations",
          value: "12 consulted, 11 clear, 1 follow-up (heritage)",
          ampel: "yellow",
        },
        {
          label: "Recurring Inspections",
          value: "N/A (new installation)",
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
          value: "EEG 2023 – 7.35 ct/kWh awarded",
          ampel: "green",
        },
        {
          label: "PPA",
          value: "PPA with EnBW until 2040, 8.1 ct/kWh",
          ampel: "green",
        },
        {
          label: "Profitability",
          value: "IRR 7.2% at P75 – bankable",
          ampel: "green",
        },
        {
          label: "Financing",
          value: "KfW IPEX + NordLB, term sheet signed",
          ampel: "green",
        },
        {
          label: "Securities",
          value: "Land charges registered, bank guarantee €2.4M",
          ampel: "green",
        },
        {
          label: "Operations",
          value: "Deutsche Windtechnik AG",
          ampel: "green",
        },
        {
          label: "Maintenance",
          value: "Vestas full-service 15yr, 97% availability",
          ampel: "green",
        },
        {
          label: "Insurance",
          value: "Allianz Wind Energy Policy incl. revenue loss",
          ampel: "green",
        },
        { label: "Open Liability", value: "None known", ampel: "green" },
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
      text: "WEA 6 & 7: Contract signing pending. Deadline Q1 2025 recommended.",
    },
    {
      domain: "Permits",
      severity: "yellow",
      text: "BImSchG decision still outstanding. Permit expected Q2 2025.",
    },
    {
      domain: "Permits",
      severity: "yellow",
      text: "Heritage protection: Follow-up request for sightline assessment.",
    },
    {
      domain: "Permits",
      severity: "yellow",
      text: "Red kite shutdown reduces expected yield by ~1.8%.",
    },
    {
      domain: "Economics",
      severity: "green",
      text: "Financing secured, PPA long-term, maintenance fully covered.",
    },
  ],
};

// Presets
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
    description: "All tables, status map, and action items",
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
    description: "Overview, risk summary, status map",
    sections: ["overview", "statusmap", "findings"],
    estimatedPages: "4–6",
  },
  {
    id: "land",
    name: "Land Security Audit",
    description: "Contracts, land registry, traffic-light map",
    sections: ["overview", "land", "statusmap", "findings"],
    estimatedPages: "8–10",
  },
  {
    id: "permit",
    name: "Permit & Compliance",
    description: "BImSchG, environment, authority consultations",
    sections: ["overview", "permits", "findings"],
    estimatedPages: "6–8",
  },
  {
    id: "economics",
    name: "Economic Review",
    description: "EEG/PPA, financing, operations, insurance",
    sections: ["overview", "economics", "findings"],
    estimatedPages: "6–8",
  },
];

// Export formats
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
    description: "Interactive, shareable",
    colorCls:
      "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/30",
  },
  {
    id: "xlsx",
    label: "XLSX",
    description: "Spreadsheet for analysis",
    colorCls:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "csv",
    label: "CSV",
    description: "Plain data, any tool",
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

// Section metadata
const SECTION_META = [
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
    desc: "BImSchG, EIA, species protection",
  },
  {
    id: "economics",
    label: "Economics & Operations",
    desc: "EEG, PPA, financing, maintenance",
  },
  {
    id: "statusmap",
    label: "Status Map (Traffic Light)",
    desc: "Green / Yellow / Red per WEA",
  },
  {
    id: "findings",
    label: "Action Items & Recommendations",
    desc: "Prioritized issues and risks",
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
}) => (
  <span
    className={cn(
      "inline-block rounded-full flex-shrink-0",
      size === "md" ? "w-3 h-3" : "w-2 h-2",
      { green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-rose-500" }[
        status
      ],
    )}
  />
);

const AmpelBadge = ({ status }: { status: Ampel }) => {
  const c = {
    green: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-400",
      l: "Secured",
    },
    yellow: {
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-400",
      l: "Partial",
    },
    red: {
      bg: "bg-rose-500/10",
      text: "text-rose-700 dark:text-rose-400",
      l: "Open",
    },
  }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium",
        c.bg,
        c.text,
      )}
    >
      <AmpelDot status={status} />
      {c.l}
    </span>
  );
};

const AusgabeblattTable = ({ section }: { section: AusgabeblattSection }) => (
  <div className="rounded-lg border border-border/60 overflow-hidden">
    <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 border-b border-border/40">
      <h4 className="text-sm font-semibold">{section.title}</h4>
    </div>
    <div className="divide-y divide-border/30">
      {section.rows.map((r, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground font-medium min-w-[200px] flex-shrink-0">
            {r.label}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              {r.ampel && <AmpelDot status={r.ampel} size="md" />}
              <span>{r.value}</span>
            </div>
            {r.note && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                {r.note}
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
          {statuses.map((w) => (
            <div
              key={w.name}
              className={cn(
                "p-3 rounded-md border",
                {
                  green: "border-emerald-500/40 bg-emerald-500/5",
                  yellow: "border-amber-500/40 bg-amber-500/5",
                  red: "border-rose-500/40 bg-rose-500/5",
                }[w.ampel],
              )}
            >
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
          ))}
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
// REPORT GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

function generateHTML(d: DDiQReportData, a: string[]): string {
  const secs = d.sections.filter((s) => a.includes(s.id));
  const ac = (x: Ampel) =>
    ({ green: "#059669", yellow: "#d97706", red: "#dc2626" })[x];
  const al = (x: Ampel) =>
    ({ green: "Secured", yellow: "Partial", red: "Open" })[x];
  const secH = secs
    .map(
      (s) =>
        `<h2 style="font-size:15px;font-weight:700;margin:28px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">${s.title}</h2><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#f8fafc;"><th style="text-align:left;padding:8px 12px;border:1px solid #e2e8f0;width:220px;">Category</th><th style="text-align:left;padding:8px 12px;border:1px solid #e2e8f0;">Status / Details</th></tr></thead><tbody>${s.rows.map((r) => `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:500;vertical-align:top;">${r.label}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${r.ampel ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ac(r.ampel)};margin-right:6px;vertical-align:middle;"></span>` : ""}${r.value}${r.note ? `<br><em style="color:#d97706;font-size:12px;">${r.note}</em>` : ""}</td></tr>`).join("")}</tbody></table>`,
    )
    .join("");
  const docList =
    d.analyzedDocuments.length > 0
      ? `<h2 style="font-size:15px;font-weight:700;margin:28px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">Analyzed Documents</h2><ul style="font-size:13px;color:#475569;">${d.analyzedDocuments.map((n) => `<li style="margin:4px 0;">${n}</li>`).join("")}</ul>`
      : "";
  const mapH = a.includes("statusmap")
    ? `<h2 style="font-size:15px;font-weight:700;margin:28px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">Land Security Status Map</h2><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#f8fafc;"><th style="padding:8px 12px;border:1px solid #e2e8f0;">WEA</th><th style="padding:8px 12px;border:1px solid #e2e8f0;">Status</th><th style="padding:8px 12px;border:1px solid #e2e8f0;">Owner</th><th style="padding:8px 12px;border:1px solid #e2e8f0;">Parcel</th><th style="padding:8px 12px;border:1px solid #e2e8f0;">Contract</th></tr></thead><tbody>${d.weaStatuses.map((w) => `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;">${w.name}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ac(w.ampel)};margin-right:6px;vertical-align:middle;"></span>${al(w.ampel)}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${w.owner}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${w.parcel}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${w.contract}</td></tr>`).join("")}</tbody></table>`
    : "";
  const findH = a.includes("findings")
    ? `<h2 style="font-size:15px;font-weight:700;margin:28px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">Action Items</h2><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#f8fafc;"><th style="width:24px;border:1px solid #e2e8f0;padding:8px;"></th><th style="text-align:left;padding:8px 12px;border:1px solid #e2e8f0;width:140px;">Domain</th><th style="text-align:left;padding:8px 12px;border:1px solid #e2e8f0;">Recommendation</th></tr></thead><tbody>${d.findings.map((f) => `<tr><td style="text-align:center;padding:8px;border:1px solid #e2e8f0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ac(f.severity)};"></span></td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:500;">${f.domain}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${f.text}</td></tr>`).join("")}</tbody></table>`
    : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>DDiQ Report – ${d.projectName}</title><style>@media print{body{font-size:12px}h1{font-size:18px}h2{font-size:14px}table{page-break-inside:avoid}}</style></head><body style="max-width:900px;margin:40px auto;padding:0 24px;font-family:system-ui,-apple-system,sans-serif;color:#1e293b;line-height:1.5;"><div style="border-bottom:3px solid #1e293b;padding-bottom:16px;margin-bottom:32px;"><h1 style="font-size:22px;font-weight:800;margin:0;">DDiQ Due Diligence Report</h1><p style="font-size:18px;font-weight:600;color:#475569;margin:4px 0 0;">${d.projectName}</p><div style="display:flex;gap:24px;margin-top:12px;font-size:12px;color:#64748b;"><span>Prepared for: ${d.preparedFor}</span><span>By: ${d.preparedBy}</span><span>Date: ${d.date}</span></div></div>${docList}${secH}${mapH}${findH}<div style="margin-top:40px;padding-top:16px;border-top:2px solid #e2e8f0;font-size:11px;color:#94a3b8;">Auto-generated by LAI · DDiQ v1. Does not substitute legal review.</div></body></html>`;
}

function generateCSV(d: DDiQReportData, a: string[]): string {
  const l = ["Section,Category,Value,Status"];
  d.sections
    .filter((s) => a.includes(s.id))
    .forEach((s) =>
      s.rows.forEach((r) =>
        l.push(
          `"${s.title}","${r.label}","${r.value.replace(/"/g, '""')}","${r.ampel || ""}"`,
        ),
      ),
    );
  if (a.includes("statusmap"))
    d.weaStatuses.forEach((w) =>
      l.push(
        `"Status Map","${w.name}","Owner: ${w.owner} | Parcel: ${w.parcel} | Contract: ${w.contract}","${w.ampel}"`,
      ),
    );
  if (a.includes("findings"))
    d.findings.forEach((f) =>
      l.push(
        `"Action Items","${f.domain}","${f.text.replace(/"/g, '""')}","${f.severity}"`,
      ),
    );
  return l.join("\n");
}

function generateTXT(d: DDiQReportData, a: string[]): string {
  const l = [
    "=".repeat(72),
    `  DDiQ Due Diligence Report`,
    `  ${d.projectName}`,
    "=".repeat(72),
    "",
    `  For: ${d.preparedFor}`,
    `  By: ${d.preparedBy}`,
    `  Date: ${d.date}`,
    "",
  ];
  if (d.analyzedDocuments.length) {
    l.push("  Analyzed Documents:");
    d.analyzedDocuments.forEach((n) => l.push(`    - ${n}`));
    l.push("");
  }
  d.sections
    .filter((s) => a.includes(s.id))
    .forEach((s) => {
      l.push(
        "",
        `--- ${s.title.toUpperCase()} ${"─".repeat(Math.max(0, 58 - s.title.length))}`,
        "",
      );
      s.rows.forEach((r) => {
        l.push(
          `  ${r.label.padEnd(28)} ${r.value}${r.ampel ? ` [${r.ampel.toUpperCase()}]` : ""}`,
        );
        if (r.note) l.push(`  ${"".padEnd(28)} >> ${r.note}`);
      });
    });
  if (a.includes("statusmap")) {
    l.push(
      "",
      "--- STATUS MAP ────────────────────────────────────────────────────",
      "",
    );
    d.weaStatuses.forEach((w) =>
      l.push(
        `  [${w.ampel.toUpperCase().padEnd(6)}] ${w.name}  |  ${w.owner}  |  ${w.parcel}  |  ${w.contract}`,
      ),
    );
  }
  if (a.includes("findings")) {
    l.push(
      "",
      "--- ACTION ITEMS ──────────────────────────────────────────────────",
      "",
    );
    d.findings.forEach((f, i) =>
      l.push(
        `  ${i + 1}. [${f.severity.toUpperCase()}] ${f.domain}: ${f.text}`,
      ),
    );
  }
  l.push("", "=".repeat(72), "  LAI DDiQ v1", "=".repeat(72));
  return l.join("\n");
}

function downloadFile(content: string, filename: string, mime: string) {
  const b = new Blob([content], { type: mime });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(u);
  document.body.removeChild(a);
}

function downloadFormat(fmt: ExportFormat, d: DDiQReportData, a: string[]) {
  const s = `DDiQ_${d.projectName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`;
  switch (fmt) {
    case "html":
      return downloadFile(
        generateHTML(d, a),
        `${s}.html`,
        "text/html;charset=utf-8",
      );
    case "csv":
      return downloadFile(
        generateCSV(d, a),
        `${s}.csv`,
        "text/csv;charset=utf-8",
      );
    case "txt":
      return downloadFile(
        generateTXT(d, a),
        `${s}.txt`,
        "text/plain;charset=utf-8",
      );
    case "pdf":
      return downloadFile(
        generateHTML(d, a),
        `${s}.html`,
        "text/html;charset=utf-8",
      );
    case "docx":
      return downloadFile(generateHTML(d, a), `${s}.doc`, "application/msword");
    case "xlsx":
      return downloadFile(
        generateCSV(d, a),
        `${s}.csv`,
        "text/csv;charset=utf-8",
      );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

type Step = "select-docs" | "configure" | "preview" | "exporting";

interface Props {
  documents: DocumentItem[];
  className?: string;
}

export default function ReportDownloadPanel({ documents, className }: Props) {
  const analyzedDocs = useMemo(
    () => documents.filter((d) => d.status === "analyzed"),
    [documents],
  );

  // Document selection
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [docSearch, setDocSearch] = useState("");

  // Wizard
  const [step, setStep] = useState<Step>("select-docs");
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

  const selectedDocs = useMemo(
    () => documents.filter((d) => selectedDocIds.has(d.id)),
    [documents, selectedDocIds],
  );
  const filteredAnalyzed = useMemo(() => {
    if (!docSearch) return analyzedDocs;
    const q = docSearch.toLowerCase();
    return analyzedDocs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q),
    );
  }, [analyzedDocs, docSearch]);

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

  // Actions
  const toggleDoc = (id: string) =>
    setSelectedDocIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const selectAll = () =>
    setSelectedDocIds(new Set(analyzedDocs.map((d) => d.id)));
  const deselectAll = () => setSelectedDocIds(new Set());
  const toggleSection = (id: string) =>
    setActiveSections((p) =>
      p.includes(id) ? p.filter((s) => s !== id) : [...p, id],
    );
  const toggleFormat = (id: ExportFormat) =>
    setSelectedFormats((p) =>
      p.includes(id)
        ? p.length > 1
          ? p.filter((f) => f !== id)
          : p
        : [...p, id],
    );
  const pickPreset = (p: ReportPreset) => {
    setSelectedPreset(p);
    setActiveSections([...p.sections]);
  };
  const resetToStart = () => {
    setStep("select-docs");
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

  const getReportData = (): DDiQReportData => ({
    ...DEMO_REPORT,
    analyzedDocuments: selectedDocs.map((d) => d.name),
  });

  const handleDownloadAll = () => {
    const rd = getReportData();
    selectedFormats.forEach((f) => downloadFormat(f, rd, activeSections));
  };
  const handleDownloadOne = (fmt: ExportFormat) =>
    downloadFormat(fmt, getReportData(), activeSections);

  // ═══════════ STEP 1: SELECT DOCUMENTS ═══════════════════════════════════

  if (step === "select-docs")
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">DDiQ Report Builder</h2>
            <p className="text-sm text-muted-foreground">
              Select documents for due diligence analysis, then configure your
              report
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Uploaded
                  </p>
                  <p className="text-2xl font-bold mt-2">{documents.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    From Documents page & Chat
                  </p>
                </div>
                <div className="p-2.5 rounded-md bg-slate-100 dark:bg-slate-800">
                  <ManuscriptIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50 border-l-4 border-l-emerald-500/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ready for Report
                  </p>
                  <p className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-500">
                    {analyzedDocs.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Analyzed documents
                  </p>
                </div>
                <div className="p-2.5 rounded-md bg-emerald-500/10">
                  <CheckRingIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50 border-l-4 border-l-blue-500/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selected</p>
                  <p className="text-2xl font-bold mt-2 text-blue-600 dark:text-blue-500">
                    {selectedDocIds.size}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    For this report
                  </p>
                </div>
                <div className="p-2.5 rounded-md bg-blue-500/10">
                  <DownloadIcon className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document selection */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Select Documents for Analysis
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs h-7"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deselectAll}
                  className="text-xs h-7"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search analyzed documents..."
                className="pl-10 h-9 text-sm"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
              />
            </div>

            {analyzedDocs.length === 0 ? (
              <div className="text-center py-8">
                <ManuscriptIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">
                  No analyzed documents available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload and analyze documents on the Documents page first
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredAnalyzed.map((doc) => {
                  const isSelected = selectedDocIds.has(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected
                          ? "border-primary/40 bg-primary/5"
                          : "border-transparent hover:bg-muted/40",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-border",
                        )}
                      >
                        {isSelected && (
                          <CheckIcon className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="p-1.5 rounded-md bg-emerald-500/10">
                        <CheckRingIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            !isSelected && "text-muted-foreground",
                          )}
                        >
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{doc.size.toFixed(1)} MB</span>
                          <span>{doc.uploadDate}</span>
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">
                            {doc.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pending/archived shown as disabled */}
            {documents.filter((d) => d.status !== "analyzed").length > 0 && (
              <>
                <Separator className="my-4" />
                <p className="text-xs text-muted-foreground mb-2">
                  Not available for report (pending or archived):
                </p>
                <div className="space-y-1 opacity-50">
                  {documents
                    .filter((d) => d.status !== "analyzed")
                    .map((doc) => {
                      const sc = statusCfg[doc.status];
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg"
                        >
                          <div className="w-5 h-5 rounded border border-border flex items-center justify-center flex-shrink-0" />
                          <div className={cn("p-1.5 rounded-md", sc.bg)}>
                            <sc.Icon className={cn("w-4 h-4", sc.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground truncate">
                              {doc.name}
                            </p>
                            <span
                              className={cn(
                                "text-[10px] font-medium px-1.5 py-0.5 rounded",
                                sc.bg,
                                sc.color,
                              )}
                            >
                              {sc.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => setStep("configure")}
            disabled={selectedDocIds.size === 0}
            className="shadow-sm"
          >
            Continue to Configure <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );

  // ═══════════ STEP 2: CONFIGURE ══════════════════════════════════════════

  if (step === "configure")
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("select-docs")}
            className="text-xs h-7 px-2"
          >
            ← Back
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Configure Report</h2>
            <p className="text-sm text-muted-foreground">
              {selectedDocIds.size} document
              {selectedDocIds.size !== 1 ? "s" : ""} selected:{" "}
              {selectedDocs
                .map((d) => d.name)
                .slice(0, 2)
                .join(", ")}
              {selectedDocs.length > 2
                ? ` +${selectedDocs.length - 2} more`
                : ""}
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
            {SECTION_META.map((sm) => {
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
                      "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0",
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

        {/* Formats */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Export Formats
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
                        "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
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
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep("select-docs")}>
            Back
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

  // ═══════════ STEP 3: PREVIEW ════════════════════════════════════════════

  if (step === "preview") {
    const rd = getReportData();
    const visSec = rd.sections.filter((s) => activeSections.includes(s.id));
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
                {selectedPreset.name} · {selectedDocIds.size} document
                {selectedDocIds.size !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 mr-2">
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
              {rd.projectName}
            </p>
            <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
              <span>For: {rd.preparedFor}</span>
              <span>By: {rd.preparedBy}</span>
              <span>Date: {rd.date}</span>
            </div>
          </div>

          {rd.analyzedDocuments.length > 0 && (
            <div className="mb-6 p-3 rounded-lg bg-muted/30 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                Analyzed Documents ({rd.analyzedDocuments.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {rd.analyzedDocuments.map((n) => (
                  <span
                    key={n}
                    className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {visSec.map((sec) => (
              <AusgabeblattTable key={sec.id} section={sec} />
            ))}
            {activeSections.includes("statusmap") && (
              <StatusMap statuses={rd.weaStatuses} />
            )}
            {activeSections.includes("findings") && (
              <FindingsTable findings={rd.findings} />
            )}
          </div>
          <div className="mt-8 pt-4 border-t border-border/40 text-[11px] text-muted-foreground">
            Auto-generated by LAI · DDiQ v1. Does not substitute legal review.
          </div>
        </div>
      </div>
    );
  }

  // ═══════════ STEP 4: EXPORTING ══════════════════════════════════════════

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
        <h2 className="text-lg font-semibold">
          {exportDone ? "Report Ready" : "Generating Report..."}
        </h2>
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
                    {selectedDocIds.size} documents
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
                    {selectedDocIds.size} documents · {activeSections.length}{" "}
                    sections · {DEMO_REPORT.findings.length} action items
                  </p>
                </div>
                {selectedFormats.length > 1 && (
                  <Button onClick={handleDownloadAll} className="shadow-sm">
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download All ({selectedFormats.length} files)
                  </Button>
                )}
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
                  <Button variant="outline" size="sm" onClick={resetToStart}>
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
