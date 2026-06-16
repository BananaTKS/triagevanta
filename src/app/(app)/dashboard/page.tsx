import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { listTicketsForUser } from "@/lib/queries";
import { isStaff } from "@/lib/rbac";
import { isOverdue, isResolved } from "@/lib/sla";
import {
  btnPrimary,
  EmptyState,
  PageHeader,
  SectionTitle,
  StatBar,
  type Stat,
} from "@/components/ui";
import { TicketsTable } from "@/components/tickets-table";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const tickets = await listTicketsForUser(user);
  const staff = isStaff(user.role);
  const now = new Date();

  const open = tickets.filter((t) => t.status === "open").length;
  const inProgress = tickets.filter((t) => t.status === "in_progress").length;
  const overdue = tickets.filter((t) => isOverdue(t.slaDueAt, t.status, now)).length;
  const unassigned = tickets.filter(
    (t) => !t.assignedToId && !isResolved(t.status),
  ).length;
  const resolved = tickets.filter((t) => isResolved(t.status)).length;

  const stats: Stat[] = [
    { label: "Open", value: open },
    { label: "In progress", value: inProgress, tone: inProgress ? "warning" : "default" },
    staff
      ? { label: "Unassigned", value: unassigned, tone: unassigned ? "warning" : "default" }
      : { label: "Resolved", value: resolved, tone: "success" },
    { label: "Overdue", value: overdue, tone: overdue ? "danger" : "default", hint: "Past SLA" },
  ];

  const recent = tickets.slice(0, 8);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        description={staff ? "Service desk overview" : "Your support tickets"}
        action={
          <Link href="/tickets/new" className={btnPrimary}>
            New ticket
          </Link>
        }
      />

      <StatBar items={stats} />

      <div className="mt-8">
        <SectionTitle>{staff ? "Recent tickets" : "Your recent tickets"}</SectionTitle>
        {recent.length > 0 ? (
          <TicketsTable tickets={recent} showRequester={staff} />
        ) : (
          <EmptyState
            title="No tickets yet"
            description={
              staff
                ? "No tickets have been submitted to the service desk."
                : "You have not submitted any tickets yet."
            }
            action={
              <Link href="/tickets/new" className={btnPrimary}>
                Create your first ticket
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
