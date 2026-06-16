import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { listNotificationsForUser } from "@/lib/queries";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const items = await listNotificationsForUser(user.id);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Mock email log — messages the system would send you about your tickets."
      />

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-zinc-900">{n.subject}</p>
                <span className="shrink-0 font-mono text-xs text-zinc-400">
                  {formatDateTime(n.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-600">{n.body}</p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="font-mono text-zinc-400">to {n.recipientEmail}</span>
                {n.ticketId && (
                  <Link
                    href={`/tickets/${n.ticketId}`}
                    className="text-teal-700 hover:underline"
                  >
                    View ticket →
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notifications"
          description="When there is activity on your tickets, the emails we would send you appear here."
        />
      )}
    </div>
  );
}
