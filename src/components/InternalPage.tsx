import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AccentName = "blue" | "green" | "yellow" | "purple" | "red" | "orange";
const ACCENT_VAR: Record<AccentName, string> = { blue: "var(--accent-blue)", green: "var(--accent-green)", yellow: "var(--accent-yellow)", purple: "var(--accent-purple)", red: "var(--accent-red)", orange: "var(--accent-orange)" };

export function InternalPage({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn("internal-page space-y-4", className)}>{children}</div>; }

export function SectionPanel({ title, subtitle, icon: Icon, right, children, className, contentClassName }: { title: string; subtitle?: string; icon?: LucideIcon; right?: ReactNode; children: ReactNode; className?: string; contentClassName?: string }) {
  return <section className={cn("panel section-panel overflow-hidden", className)}><div className="section-panel__header"><div className="flex min-w-0 items-center gap-3">{Icon && <span className="section-panel__icon"><Icon className="h-4 w-4"/></span>}<div className="min-w-0"><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>{right && <div className="shrink-0">{right}</div>}</div><div className={cn("section-panel__content", contentClassName)}>{children}</div></section>;
}

export function StatCard({ label, value, unit, detail, icon: Icon, accent = "blue", className }: { label: string; value: string | number; unit?: string; detail?: string; icon?: LucideIcon; accent?: AccentName; className?: string }) {
  const color = ACCENT_VAR[accent];
  return <div className={cn("panel summary-card", className)}><div className="flex items-start justify-between gap-3"><div><div className="summary-card__label">{label}</div><div className="summary-card__value">{value}{unit && <small>{unit}</small>}</div>{detail && <p>{detail}</p>}</div>{Icon && <span className="summary-card__icon" style={{ color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}><Icon className="h-4 w-4"/></span>}</div></div>;
}

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn("panel page-toolbar", className)}>{children}</div>; }

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "positive" | "warning" | "danger" | "info" | "neutral" }) {
  return <span className={`status-pill status-pill--${tone}`}>{label}</span>;
}

export const chartTooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--panel-shadow)", fontSize: 12, color: "var(--popover-foreground)" };
