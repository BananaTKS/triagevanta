import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { listOnboardings } from "@/lib/queries";
import { btnPrimary, Card, EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function OnboardingPage() {
  await requireRole("it_staff", "admin");
  const items = await listOnboardings();

  return (
    <div>
      <PageHeader
        title="Onboarding"
        description="New-joiner setup checklists."
        action={
          <Link href="/onboarding/new" className={btnPrimary}>
            New onboarding
          </Link>
        }
      />

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((o) => {
            const complete = o.total > 0 && o.done === o.total;
            return (
              <Link key={o.id} href={`/onboarding/${o.id}`} className="block">
                <Card className="p-4 transition hover:border-zinc-300 hover:bg-zinc-50/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-900">{o.employeeName}</p>
                      <p className="text-xs text-zinc-500">
                        {o.title ?? "New joiner"}
                        {o.startDate ? ` · starts ${formatDate(o.startDate)}` : ""}
                      </p>
                    </div>
                    {complete && (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                        Complete
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <ProgressBar done={o.done} total={o.total} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No onboardings yet"
          description="Start a checklist for a new joiner."
          action={
            <Link href="/onboarding/new" className={btnPrimary}>
              New onboarding
            </Link>
          }
        />
      )}
    </div>
  );
}
