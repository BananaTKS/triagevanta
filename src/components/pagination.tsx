import Link from "next/link";
import type { TicketFilter } from "@/lib/queries";
import { btnSecondary } from "@/components/ui";
import { cn } from "@/lib/cn";

function hrefFor(filter: TicketFilter, page: number): string {
  const sp = new URLSearchParams();
  if (filter.q) sp.set("q", filter.q);
  if (filter.status) sp.set("status", filter.status);
  if (filter.priority) sp.set("priority", filter.priority);
  if (filter.category) sp.set("category", filter.category);
  if (filter.assignee) sp.set("assignee", filter.assignee);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/tickets?${qs}` : "/tickets";
}

export function Pagination({
  filter,
  page,
  totalPages,
}: {
  filter: TicketFilter;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const disabled = "pointer-events-none opacity-40";

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-zinc-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(filter, page - 1)}
          aria-disabled={page <= 1}
          className={cn(btnSecondary, page <= 1 && disabled)}
        >
          Previous
        </Link>
        <Link
          href={hrefFor(filter, page + 1)}
          aria-disabled={page >= totalPages}
          className={cn(btnSecondary, page >= totalPages && disabled)}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
