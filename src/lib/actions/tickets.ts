"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ticketNotes, tickets, users } from "@/db/schema";
import { getCurrentUser, requireRole } from "@/lib/dal";
import { canViewInternalNotes, isStaff } from "@/lib/rbac";
import { computeSlaDueAt } from "@/lib/sla";
import { logSecurityEvent } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { STATUS_LABELS } from "@/lib/constants";
import {
  AddNoteSchema,
  AssignSchema,
  CreateTicketSchema,
  UpdateStatusSchema,
} from "@/lib/validation";
import type { FormState } from "@/lib/form";

function revalidateTicket(id: string) {
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${id}`);
  revalidatePath("/dashboard");
}

export async function createTicketAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();

  const parsed = CreateTicketSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    category: formData.get("category"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { title, description, priority, category } = parsed.data;
  const [ticket] = await db
    .insert(tickets)
    .values({
      title,
      description,
      priority,
      category,
      createdById: user.id,
      slaDueAt: computeSlaDueAt(priority),
    })
    .returning({ id: tickets.id });

  if (!ticket) {
    return { error: "Could not create the ticket. Please try again." };
  }

  await notify({
    recipientId: user.id,
    subject: `Ticket received: ${title}`,
    body: `Hi ${user.name}, we've received your ticket "${title}" and the IT team will review it shortly.`,
    ticketId: ticket.id,
  });

  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  redirect(`/tickets/${ticket.id}`);
}

export async function addNoteAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();

  const parsed = AddNoteSchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
    isInternal: formData.get("isInternal") === "on",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { ticketId, body, isInternal } = parsed.data;

  // Confirm the user may access this ticket before letting them comment.
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
    columns: { id: true, createdById: true, title: true },
  });
  if (!ticket) return { error: "Ticket not found." };
  if (!isStaff(user.role) && ticket.createdById !== user.id) {
    return { error: "You do not have access to this ticket." };
  }

  // Only staff/admin can post internal notes.
  const internal = canViewInternalNotes(user.role) ? isInternal : false;
  await db.insert(ticketNotes).values({
    ticketId,
    authorId: user.id,
    body,
    isInternal: internal,
  });

  revalidateTicket(ticketId);

  // Notify the requester of a public reply from someone else.
  if (!internal && ticket.createdById !== user.id) {
    await notify({
      recipientId: ticket.createdById,
      subject: `New reply on your ticket: ${ticket.title}`,
      body: `${user.name} replied to your ticket "${ticket.title}".`,
      ticketId,
    });
  }

  return {};
}

export async function updateStatusAction(formData: FormData): Promise<void> {
  const actor = await requireRole("it_staff", "admin");

  const parsed = UpdateStatusSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const { ticketId, status } = parsed.data;
  await db
    .update(tickets)
    .set({ status, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));

  revalidateTicket(ticketId);

  // Notify the requester (unless they changed it themselves).
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
    columns: { createdById: true, title: true },
  });
  if (ticket && ticket.createdById !== actor.id) {
    await notify({
      recipientId: ticket.createdById,
      subject: `Ticket status updated: ${ticket.title}`,
      body: `Your ticket "${ticket.title}" is now ${STATUS_LABELS[status]}.`,
      ticketId,
    });
  }
}

export async function assignTicketAction(formData: FormData): Promise<void> {
  const actor = await requireRole("it_staff", "admin");

  const parsed = AssignSchema.safeParse({
    ticketId: formData.get("ticketId"),
    assigneeId: formData.get("assigneeId"),
  });
  if (!parsed.success) return;

  const { ticketId, assigneeId } = parsed.data;

  // If assigning to someone, make sure they are real IT staff/admin.
  if (assigneeId) {
    const assignee = await db.query.users.findFirst({
      where: eq(users.id, assigneeId),
      columns: { id: true, role: true },
    });
    if (!assignee || !isStaff(assignee.role)) return;
  }

  await db
    .update(tickets)
    .set({ assignedToId: assigneeId, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));

  await logSecurityEvent({
    type: "ticket_assigned",
    actorId: actor.id,
    targetId: ticketId,
    metadata: { assigneeId },
  });

  revalidateTicket(ticketId);

  // Notify the new assignee (mock email).
  if (assigneeId && assigneeId !== actor.id) {
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
      columns: { title: true },
    });
    if (ticket) {
      await notify({
        recipientId: assigneeId,
        subject: `Ticket assigned to you: ${ticket.title}`,
        body: `You have been assigned the ticket "${ticket.title}".`,
        ticketId,
      });
    }
  }
}
