import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { getOnboarding, type OnboardingDetail } from "@/lib/queries";
import { Card, PageHeader, ProgressBar, SectionTitle } from "@/components/ui";
import { OnboardingTaskToggle } from "@/components/onboarding-task-toggle";
import { PrintButton } from "@/components/print-button";
import { formatDate } from "@/lib/format";

export default async function OnboardingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("it_staff", "admin");
  const { id } = await params;
  const onboarding = await getOnboarding(id);
  if (!onboarding) notFound();

  const total = onboarding.tasks.length;
  const done = onboarding.tasks.filter((t) => t.done).length;

  // Group tasks by category, preserving order.
  const groups: { category: string; tasks: OnboardingDetail["tasks"] }[] = [];
  for (const task of onboarding.tasks) {
    let group = groups.find((g) => g.category === task.category);
    if (!group) {
      group = { category: task.category, tasks: [] };
      groups.push(group);
    }
    group.tasks.push(task);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 print:hidden">
        <Link href="/onboarding" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back to onboarding
        </Link>
      </div>

      <PageHeader
        title={onboarding.employeeName}
        description={`${onboarding.title ?? "New joiner"}${
          onboarding.startDate ? ` · starts ${formatDate(onboarding.startDate)}` : ""
        }`}
        action={<PrintButton />}
      />

      <Card className="p-5">
        <ProgressBar done={done} total={total} />
      </Card>

      <div className="mt-6 space-y-5">
        {groups.map((group) => (
          <Card key={group.category} className="p-5">
            <SectionTitle>{group.category}</SectionTitle>
            <div className="space-y-1">
              {group.tasks.map((task) => (
                <OnboardingTaskToggle
                  key={task.id}
                  id={task.id}
                  label={task.label}
                  done={task.done}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
