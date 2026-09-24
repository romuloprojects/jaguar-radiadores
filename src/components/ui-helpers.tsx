import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function PageHeader({ title, subtitle, right, eyebrow, icon: Icon }: { title: string; subtitle?: string; right?: ReactNode; eyebrow?: string; icon?: LucideIcon }) {
  return (
    <header className="page-heading">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && <span className="page-heading__icon"><Icon className="h-5 w-5" /></span>}
        <div className="min-w-0">
          {eyebrow && <div className="page-heading__eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }: { title: string; description?: string; action?: ReactNode; icon?: LucideIcon }) {
  return <div className="panel empty-state"><span className="empty-state__icon"><Icon className="h-5 w-5" /></span><div className="mt-3 text-sm font-semibold">{title}</div>{description && <div className="mt-1 max-w-md text-xs text-muted-foreground">{description}</div>}{action && <div className="mt-4">{action}</div>}</div>;
}
