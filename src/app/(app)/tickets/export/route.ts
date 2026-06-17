import { getCurrentUser } from "@/lib/dal";
import { listTicketsForUser } from "@/lib/queries";
import { toCsv } from "@/lib/csv";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";

// GET /tickets/export — CSV of the caller's visible tickets (role-scoped).
export async function GET() {
  const user = await getCurrentUser();
  const tickets = await listTicketsForUser(user);

  const csv = toCsv(
    ["Title", "Status", "Priority", "Category", "Requester", "Assignee", "Created", "SLA due"],
    tickets.map((t) => [
      t.title,
      STATUS_LABELS[t.status],
      PRIORITY_LABELS[t.priority],
      CATEGORY_LABELS[t.category],
      t.createdBy.name,
      t.assignedTo?.name ?? "",
      formatDate(t.createdAt),
      formatDate(t.slaDueAt),
    ]),
  );

  const filename = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
