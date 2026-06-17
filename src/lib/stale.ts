const DAY_MS = 24 * 60 * 60 * 1000;

export interface StaleOptions {
  /** Days a ticket may sit in "resolved" before auto-closing. Default 7. */
  days?: number;
  now?: Date;
}

// `status` is typed loosely (string) so this helper has no schema dependency and
// can be imported by the standalone auto-close script as well as the app.
export function isStaleResolved(
  status: string,
  updatedAt: Date,
  options: StaleOptions = {},
): boolean {
  if (status !== "resolved") return false;
  const days = options.days ?? 7;
  const now = options.now ?? new Date();
  return now.getTime() - updatedAt.getTime() > days * DAY_MS;
}

export function staleResolvedTicketIds(
  tickets: { id: string; status: string; updatedAt: Date }[],
  options: StaleOptions = {},
): string[] {
  return tickets
    .filter((t) => isStaleResolved(t.status, t.updatedAt, options))
    .map((t) => t.id);
}
