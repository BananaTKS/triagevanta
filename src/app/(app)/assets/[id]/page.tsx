import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { getAsset, listAssignableUsers } from "@/lib/queries";
import { btnSecondary, Card, PageHeader, SectionTitle } from "@/components/ui";
import {
  AssetConditionBadge,
  AssetStatusBadge,
  AssetTypeBadge,
} from "@/components/badges";
import { AssetAssignControl } from "@/components/asset-assign-control";
import { AssetStatusControl } from "@/components/asset-status-control";
import { ASSET_EVENT_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="flex items-center gap-2 text-zinc-700">{children}</dd>
    </div>
  );
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("it_staff", "admin");
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  const users = await listAssignableUsers();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/assets" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back to assets
        </Link>
        <Link href={`/assets/${asset.id}/edit`} className={btnSecondary}>
          Edit
        </Link>
      </div>

      <PageHeader
        title={asset.name}
        description={asset.assetTag}
        action={<AssetTypeBadge type={asset.type} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <SectionTitle>Details</SectionTitle>
            <dl className="space-y-3 text-sm">
              <Row label="Status">
                <AssetStatusBadge status={asset.status} />
              </Row>
              <Row label="Condition">
                <AssetConditionBadge condition={asset.condition} />
              </Row>
              <Row label="Assigned to">
                {asset.assignedTo?.name ?? <span className="text-zinc-400">Unassigned</span>}
              </Row>
              <Row label="Serial number">
                <span className="font-mono text-xs">{asset.serialNumber ?? "—"}</span>
              </Row>
              <Row label="Warranty expires">
                {asset.warrantyExpiresAt ? formatDate(asset.warrantyExpiresAt) : "—"}
              </Row>
            </dl>
            {asset.notes && (
              <p className="mt-4 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
                {asset.notes}
              </p>
            )}
          </Card>

          <Card className="p-5">
            <SectionTitle>History</SectionTitle>
            {asset.events.length > 0 ? (
              <ul className="space-y-3">
                {asset.events.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-start justify-between gap-3 border-l-2 border-zinc-200 pl-3"
                  >
                    <div>
                      <p className="text-sm text-zinc-800">
                        <span className="font-medium">{ASSET_EVENT_LABELS[e.type]}</span>
                        {e.note ? ` — ${e.note}` : ""}
                      </p>
                      <p className="text-xs text-zinc-400">{e.actor?.name ?? "System"}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-zinc-400">
                      {formatDateTime(e.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No history yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <SectionTitle>Manage</SectionTitle>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-medium text-zinc-500">Assign to</p>
                <AssetAssignControl
                  assetId={asset.id}
                  assignedToId={asset.assignedToId}
                  users={users}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-zinc-500">Status</p>
                <AssetStatusControl assetId={asset.id} status={asset.status} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
