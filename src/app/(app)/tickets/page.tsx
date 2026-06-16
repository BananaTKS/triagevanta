import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { listTicketsForUser } from "@/lib/queries";
import { isStaff } from "@/lib/rbac";
import { btnPrimary, EmptyState, PageHeader } from "@/components/ui";
import { TicketsTable } from "@/components/tickets-table";

export default async function TicketsPage() {
  const user = await getCurrentUser();
  const tickets = await listTicketsForUser(user);
  const staff = isStaff(user.role);

  return (
    <div>
      <PageHeader
        title="Tickets"
        description={
          staff ? "All service desk tickets" : "Tickets you have submitted"
        }
        action={
          <Link href="/tickets/new" className={btnPrimary}>
            New ticket
          </Link>
        }
      />
      {tickets.length > 0 ? (
        <TicketsTable tickets={tickets} showRequester={staff} />
      ) : (
        <EmptyState
          title="No tickets"
          description={
            staff
              ? "No tickets have been submitted yet."
              : "You have not submitted any tickets yet."
          }
          action={
            <Link href="/tickets/new" className={btnPrimary}>
              New ticket
            </Link>
          }
        />
      )}
    </div>
  );
}
