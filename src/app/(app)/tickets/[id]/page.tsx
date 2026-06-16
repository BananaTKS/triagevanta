import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import {
  getTicketDetail,
  listStaffUsers,
  relatedArticlesForTicket,
} from "@/lib/queries";
import { canViewInternalNotes, isStaff } from "@/lib/rbac";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import {
  CategoryBadge,
  OverdueBadge,
  PriorityBadge,
  RoleBadge,
  StatusBadge,
} from "@/components/badges";
import { TicketStatusControl } from "@/components/ticket-status-control";
import { TicketAssignControl } from "@/components/ticket-assign-control";
import { AddNoteForm } from "@/components/forms/add-note-form";
import { formatSla, isOverdue } from "@/lib/sla";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="flex items-center gap-2">{children}</dd>
    </div>
  );
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const ticket = await getTicketDetail(id, user);
  if (!ticket) notFound();

  const staff = isStaff(user.role);
  const staffList = staff ? await listStaffUsers() : [];
  const related = await relatedArticlesForTicket(ticket.category);
  const now = new Date();
  const overdue = isOverdue(ticket.slaDueAt, ticket.status, now);

  return (
    <div>
      <div className="mb-4">
        <Link href="/tickets" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back to tickets
        </Link>
      </div>

      <PageHeader
        title={ticket.title}
        description={`Opened by ${ticket.createdBy.name} · ${formatDateTime(ticket.createdAt)}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <SectionTitle>Description</SectionTitle>
            <p className="whitespace-pre-wrap text-sm text-zinc-700">
              {ticket.description}
            </p>
          </Card>

          <Card className="p-5">
            <SectionTitle>Activity &amp; notes</SectionTitle>
            {ticket.notes.length > 0 ? (
              <ul className="space-y-3">
                {ticket.notes.map((note) => (
                  <li
                    key={note.id}
                    className={cn(
                      "rounded-md border p-3",
                      note.isInternal
                        ? "border-amber-200 bg-amber-50/70"
                        : "border-zinc-200 bg-white",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                        {note.author.name}
                        <RoleBadge role={note.author.role} />
                      </span>
                      <span className="font-mono text-xs text-zinc-400">
                        {formatDateTime(note.createdAt)}
                      </span>
                    </div>
                    {note.isInternal && (
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        Internal note
                      </p>
                    )}
                    <p className="whitespace-pre-wrap text-sm text-zinc-700">
                      {note.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No notes yet.</p>
            )}

            <div className="mt-5 border-t border-zinc-200 pt-5">
              <AddNoteForm
                ticketId={ticket.id}
                canPostInternal={canViewInternalNotes(user.role)}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <SectionTitle>Details</SectionTitle>
            <dl className="space-y-3 text-sm">
              <Row label="Status">
                <StatusBadge status={ticket.status} />
              </Row>
              <Row label="Priority">
                <PriorityBadge priority={ticket.priority} />
              </Row>
              <Row label="Category">
                <CategoryBadge category={ticket.category} />
              </Row>
              <Row label="SLA">
                <span className={overdue ? "font-medium text-rose-600" : "text-zinc-700"}>
                  {formatSla(ticket.slaDueAt, ticket.status, now)}
                </span>
                {overdue && <OverdueBadge />}
              </Row>
              <Row label="Requester">
                <span className="text-zinc-700">{ticket.createdBy.name}</span>
              </Row>
              <Row label="Assignee">
                <span className="text-zinc-700">
                  {ticket.assignedTo?.name ?? "Unassigned"}
                </span>
              </Row>
            </dl>
          </Card>

          {staff && (
            <Card className="p-5">
              <SectionTitle>Manage</SectionTitle>
              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-medium text-zinc-500">Update status</p>
                  <TicketStatusControl ticketId={ticket.id} status={ticket.status} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-zinc-500">Assign to</p>
                  <TicketAssignControl
                    ticketId={ticket.id}
                    assigneeId={ticket.assignedToId}
                    staff={staffList}
                  />
                </div>
              </div>
            </Card>
          )}

          {related.length > 0 && (
            <Card className="p-5">
              <SectionTitle>Related articles</SectionTitle>
              <ul className="space-y-2">
                {related.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/kb/${a.id}`}
                      className="text-sm text-teal-700 hover:underline"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
