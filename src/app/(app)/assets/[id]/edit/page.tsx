import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { getAsset } from "@/lib/queries";
import { Card, PageHeader } from "@/components/ui";
import { AssetForm } from "@/components/asset-form";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("it_staff", "admin");
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit asset" description={asset.assetTag} />
      <Card className="p-6">
        <AssetForm asset={asset} />
      </Card>
    </div>
  );
}
