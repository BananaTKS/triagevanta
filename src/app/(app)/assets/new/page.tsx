import { requireRole } from "@/lib/dal";
import { Card, PageHeader } from "@/components/ui";
import { AssetForm } from "@/components/asset-form";

export default async function NewAssetPage() {
  await requireRole("it_staff", "admin");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add asset" description="Register a new piece of hardware." />
      <Card className="p-6">
        <AssetForm />
      </Card>
    </div>
  );
}
