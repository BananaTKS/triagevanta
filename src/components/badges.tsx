import type {
  Role,
  SecurityEventType,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/db/schema";
import { cn } from "@/lib/cn";
import {
  CATEGORY_LABELS,
  PRIORITY_CHIP,
  PRIORITY_LABELS,
  ROLE_CHIP,
  ROLE_LABELS,
  SECURITY_EVENT_CHIP,
  SECURITY_EVENT_LABELS,
  STATUS_DOT,
  STATUS_LABELS,
} from "@/lib/constants";

const chip =
  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium";

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-700">
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={cn(chip, PRIORITY_CHIP[priority])}>{PRIORITY_LABELS[priority]}</span>;
}

export function RoleBadge({ role }: { role: Role }) {
  return <span className={cn(chip, ROLE_CHIP[role])}>{ROLE_LABELS[role]}</span>;
}

export function CategoryBadge({ category }: { category: TicketCategory }) {
  return <span className="text-xs text-zinc-500">{CATEGORY_LABELS[category]}</span>;
}

export function SecurityEventBadge({ type }: { type: SecurityEventType }) {
  return (
    <span className={cn(chip, SECURITY_EVENT_CHIP[type])}>
      {SECURITY_EVENT_LABELS[type]}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
      Overdue
    </span>
  );
}
