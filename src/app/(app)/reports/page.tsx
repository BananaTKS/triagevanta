import { requireRole } from "@/lib/dal";
import { getTicketReport } from "@/lib/queries";
import { Card, PageHeader, SectionTitle, StatBar, type Stat } from "@/components/ui";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
} from "@/lib/constants";

function Breakdown({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Card className="p-5">
      <SectionTitle>{title}</SectionTitle>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-sm text-zinc-600">{i.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-teal-600"
                style={{ width: `${(i.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-sm tabular-nums text-zinc-700">
              {i.count}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default async function ReportsPage() {
  await requireRole("it_staff", "admin");
  const report = await getTicketReport();
  const monthLabel = report.monthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const stats: Stat[] = [
    { label: "Opened this month", value: report.openedThisMonth },
    { label: "Resolved this month", value: report.resolvedThisMonth, tone: "success" },
    { label: "Open now", value: report.openNow },
    {
      label: "Overdue",
      value: report.overdue,
      tone: report.overdue ? "danger" : "default",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        description={`Service desk summary · ${monthLabel}`}
      />
      <StatBar items={stats} />
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Breakdown
          title="Tickets by status"
          items={STATUS_ORDER.map((s) => ({
            label: STATUS_LABELS[s],
            count: report.byStatus[s] ?? 0,
          }))}
        />
        <Breakdown
          title="Tickets by category"
          items={CATEGORY_ORDER.map((c) => ({
            label: CATEGORY_LABELS[c],
            count: report.byCategory[c] ?? 0,
          }))}
        />
      </div>
    </div>
  );
}
