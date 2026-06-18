import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import {
  listSavedViews,
  listStaffUsers,
  searchTickets,
  type TicketFilter,
} from "@/lib/queries";
import { isStaff } from "@/lib/rbac";
import { btnPrimary, btnSecondary, EmptyState, PageHeader } from "@/components/ui";
import { TicketsTable } from "@/components/tickets-table";
import { TicketFilters } from "@/components/ticket-filters";
import { SavedViews } from "@/components/saved-views";
import { Pagination } from "@/components/pagination";
import { CATEGORY_ORDER, PRIORITY_ORDER, STATUS_ORDER } from "@/lib/constants";

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  const staff = isStaff(user.role);
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : undefined;

  const filter: TicketFilter = {
    q: str(sp.q)?.trim() || undefined,
    status: pick(sp.status, STATUS_ORDER),
    priority: pick(sp.priority, PRIORITY_ORDER),
    category: pick(sp.category, CATEGORY_ORDER),
    assignee: staff ? str(sp.assignee) || undefined : undefined,
    page: Number.parseInt(str(sp.page) ?? "1", 10) || 1,
  };

  const { items, total, page, totalPages } = await searchTickets(user, filter);
  const staffList = staff ? await listStaffUsers() : [];
  const savedViews = staff ? await listSavedViews(user.id) : [];

  const cp = new URLSearchParams();
  if (filter.q) cp.set("q", filter.q);
  if (filter.status) cp.set("status", filter.status);
  if (filter.priority) cp.set("priority", filter.priority);
  if (filter.category) cp.set("category", filter.category);
  if (filter.assignee) cp.set("assignee", filter.assignee);
  const currentParams = cp.toString();

  const hasFilters = Boolean(
    filter.q ||
      filter.status ||
      filter.priority ||
      filter.category ||
      filter.assignee,
  );

  return (
    <div>
      <PageHeader
        title="Tickets"
        description={staff ? "All service desk tickets" : "Tickets you have submitted"}
        action={
          <div className="flex gap-2">
            <a href="/tickets/export" className={btnSecondary} download>
              Export CSV
            </a>
            <Link href="/tickets/new" className={btnPrimary}>
              New ticket
            </Link>
          </div>
        }
      />

      {staff && <SavedViews views={savedViews} currentParams={currentParams} />}

      <TicketFilters current={filter} staff={staffList} showAssignee={staff} />

      <p className="mb-3 text-sm text-zinc-500">
        {total} {total === 1 ? "ticket" : "tickets"}
        {hasFilters ? " matching your filters" : ""}
      </p>

      {items.length > 0 ? (
        <>
          <TicketsTable tickets={items} showRequester={staff} />
          <Pagination filter={filter} page={page} totalPages={totalPages} />
        </>
      ) : (
        <EmptyState
          title={hasFilters ? "No matching tickets" : "No tickets"}
          description={
            hasFilters
              ? "Try clearing or changing your filters."
              : staff
                ? "No tickets have been submitted yet."
                : "You have not submitted any tickets yet."
          }
          action={
            hasFilters ? (
              <Link href="/tickets" className={btnPrimary}>
                Clear filters
              </Link>
            ) : (
              <Link href="/tickets/new" className={btnPrimary}>
                New ticket
              </Link>
            )
          }
        />
      )}
    </div>
  );
}
