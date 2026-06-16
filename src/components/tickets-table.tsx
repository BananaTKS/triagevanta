import Link from "next/link";
import type { TicketListItem } from "@/lib/queries";
import {
  CategoryBadge,
  OverdueBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/badges";
import { formatSla, isOverdue } from "@/lib/sla";
import { formatDate } from "@/lib/format";

export function TicketsTable({
  tickets,
  showRequester = false,
}: {
  tickets: TicketListItem[];
  showRequester?: boolean;
}) {
  const now = new Date();
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
            <th className="px-4 py-2.5 font-medium">Ticket</th>
            {showRequester && <th className="px-4 py-2.5 font-medium">Requester</th>}
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Priority</th>
            <th className="px-4 py-2.5 font-medium">SLA</th>
            <th className="px-4 py-2.5 font-medium">Assignee</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {tickets.map((t) => {
            const overdue = isOverdue(t.slaDueAt, t.status, now);
            return (
              <tr key={t.id} className="hover:bg-zinc-50/70">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/tickets/${t.id}`}
                    className="font-medium text-zinc-900 hover:text-teal-700"
                  >
                    {t.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2">
                    <CategoryBadge category={t.category} />
                    <span className="font-mono text-xs text-zinc-400">
                      {formatDate(t.createdAt)}
                    </span>
                  </div>
                </td>
                {showRequester && (
                  <td className="px-4 py-2.5 text-zinc-600">{t.createdBy.name}</td>
                )}
                <td className="px-4 py-2.5">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-2.5">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className={overdue ? "font-medium text-rose-600" : "text-zinc-600"}>
                    {formatSla(t.slaDueAt, t.status, now)}
                  </span>
                  {overdue && (
                    <span className="ml-2 align-middle">
                      <OverdueBadge />
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-zinc-600">
                  {t.assignedTo?.name ?? <span className="text-zinc-400">Unassigned</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
