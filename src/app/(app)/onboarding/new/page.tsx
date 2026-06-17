import { requireRole } from "@/lib/dal";
import { Card, PageHeader } from "@/components/ui";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function NewOnboardingPage() {
  await requireRole("it_staff", "admin");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New onboarding"
        description="Create a setup checklist for a new joiner."
      />
      <Card className="p-6">
        <OnboardingForm />
      </Card>
    </div>
  );
}
