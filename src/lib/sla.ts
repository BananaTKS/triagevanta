import type { TicketPriority, TicketStatus } from "@/db/schema";

/** Hours until SLA breach, by priority. */
export const SLA_HOURS: Record<TicketPriority, number> = {
  urgent: 4,
  high: 8,
  medium: 24,
  low: 72,
};

const HOUR_MS = 60 * 60 * 1000;

/** Statuses that stop the SLA clock. */
const RESOLVED_STATUSES: readonly TicketStatus[] = ["resolved", "closed"];

export function isResolved(status: TicketStatus): boolean {
  return RESOLVED_STATUSES.includes(status);
}

/** Compute the SLA due date for a ticket created at `from`. */
export function computeSlaDueAt(priority: TicketPriority, from: Date = new Date()): Date {
  return new Date(from.getTime() + SLA_HOURS[priority] * HOUR_MS);
}

/** A ticket is overdue if its SLA has passed and it is not yet resolved/closed. */
export function isOverdue(
  slaDueAt: Date,
  status: TicketStatus,
  now: Date = new Date(),
): boolean {
  if (isResolved(status)) return false;
  return now.getTime() > slaDueAt.getTime();
}

/** Milliseconds until the SLA breaches (negative if already overdue). */
export function slaRemainingMs(slaDueAt: Date, now: Date = new Date()): number {
  return slaDueAt.getTime() - now.getTime();
}

/** Human-readable SLA status, e.g. "5h left", "Overdue by 2h", "Resolved". */
export function formatSla(
  slaDueAt: Date,
  status: TicketStatus,
  now: Date = new Date(),
): string {
  if (isResolved(status)) return "Resolved";
  const ms = slaRemainingMs(slaDueAt, now);
  const hours = Math.round(Math.abs(ms) / HOUR_MS);
  const label = hours >= 48 ? `${Math.round(hours / 24)}d` : `${hours}h`;
  return ms >= 0 ? `${label} left` : `Overdue by ${label}`;
}
