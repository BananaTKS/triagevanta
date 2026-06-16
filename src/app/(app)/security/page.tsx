import { requireRole } from "@/lib/dal";
import { getRecentSecurityEvents } from "@/lib/queries";
import { detectFailedLoginSpikes } from "@/lib/security-alerts";
import { EmptyState, PageHeader, SectionTitle, StatBar, type Stat } from "@/components/ui";
import { SecurityEventBadge } from "@/components/badges";
import { formatDateTime } from "@/lib/format";

export default async function SecurityPage() {
  // Admin-only — enforced server-side (UI link is also hidden for non-admins).
  await requireRole("admin");

  const events = await getRecentSecurityEvents(200);
  const now = new Date();
  const dayAgo = now.getTime() - 24 * 60 * 60 * 1000;

  const failures24 = events.filter(
    (e) => e.type === "login_failure" && e.createdAt.getTime() >= dayAgo,
  ).length;
  const logins24 = events.filter(
    (e) => e.type === "login_success" && e.createdAt.getTime() >= dayAgo,
  ).length;

  const alerts = detectFailedLoginSpikes(events, { now });

  const stats: Stat[] = [
    { label: "Failed logins (24h)", value: failures24, tone: failures24 ? "danger" : "default" },
    { label: "Active alerts", value: alerts.length, tone: alerts.length ? "danger" : "success" },
    { label: "Logins (24h)", value: logins24 },
    { label: "Total events", value: events.length, hint: "Most recent 200" },
  ];

  return (
    <div>
      <PageHeader
        title="Security monitoring"
        description="Authentication and audit events across TriageVanta."
      />

      <StatBar items={stats} />

      <section className="mt-8">
        <SectionTitle>Failed-login alerts</SectionTitle>
        {alerts.length > 0 ? (
          <div className="space-y-2.5">
            {alerts.map((a) => (
              <div
                key={a.key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 border-l-4 border-l-rose-500 bg-rose-50/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-rose-800">
                    {a.count} failed logins for {a.email}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-rose-600">
                    {a.ip} · {formatDateTime(a.firstAt)} – {formatDateTime(a.lastAt)}
                  </p>
                </div>
                <span className="rounded bg-rose-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Threshold exceeded
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active alerts"
            description="No failed-login spikes detected in the alerting window (5+ failures per account/IP in 15 minutes)."
          />
        )}
      </section>

      <section className="mt-8">
        <SectionTitle>Event log</SectionTitle>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-2.5 font-medium">Event</th>
                <th className="px-4 py-2.5 font-medium">Actor / target</th>
                <th className="px-4 py-2.5 font-medium">IP</th>
                <th className="px-4 py-2.5 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-50/70">
                  <td className="px-4 py-2.5">
                    <SecurityEventBadge type={e.type} />
                  </td>
                  <td className="px-4 py-2.5 text-zinc-700">
                    {e.actor?.name ?? e.targetEmail ?? "—"}
                    {e.actor?.email && (
                      <span className="block font-mono text-xs text-zinc-400">
                        {e.actor.email}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">
                    {e.ip ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap font-mono text-xs text-zinc-500">
                    {formatDateTime(e.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
