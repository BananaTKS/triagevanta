import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";

/**
 * Record a mock email notification for a recipient. This simulates sending an
 * email (no SMTP) — the entry shows up in the recipient's Notifications inbox.
 */
export async function notify(input: {
  recipientId: string;
  subject: string;
  body: string;
  ticketId?: string | null;
}): Promise<void> {
  const recipient = await db.query.users.findFirst({
    where: eq(users.id, input.recipientId),
    columns: { email: true },
  });
  if (!recipient) return;

  await db.insert(notifications).values({
    recipientId: input.recipientId,
    recipientEmail: recipient.email,
    subject: input.subject,
    body: input.body,
    ticketId: input.ticketId ?? null,
  });
}
