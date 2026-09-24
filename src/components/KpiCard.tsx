import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "green" | "blue" | "red" | "amber" | "slate";

export function KpiCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "slate",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <article className={cn("jaguar-kpi panel", className)} data-tone={tone}>
      <div className="jaguar-kpi__icon"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0">
        <div className="jaguar-kpi__label">{label}</div>
        <div className="jaguar-kpi__value">{value}</div>
        {detail && <div className="jaguar-kpi__detail">{detail}</div>}
      </div>
    </article>
  );
}
