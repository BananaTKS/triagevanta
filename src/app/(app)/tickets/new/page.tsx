import { getCurrentUser } from "@/lib/dal";
import { Card, PageHeader } from "@/components/ui";
import { CreateTicketForm } from "@/components/forms/create-ticket-form";

export default async function NewTicketPage() {
  // Ensure the visitor is authenticated.
  await getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New ticket"
        description="Tell us what you need help with and we'll triage it."
      />
      <Card className="p-6">
        <CreateTicketForm />
      </Card>
    </div>
  );
}
