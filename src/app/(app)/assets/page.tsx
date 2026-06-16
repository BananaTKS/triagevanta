import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { listAssets } from "@/lib/queries";
import {
  btnPrimary,
  btnSecondary,
  EmptyState,
  inputClass,
  PageHeader,
} from "@/components/ui";
import {
  AssetConditionBadge,
  AssetStatusBadge,
  AssetTypeBadge,
} from "@/components/badges";
import { cn } from "@/lib/cn";
import {
  ASSET_STATUS_LABELS,
  ASSET_STATUS_ORDER,
  ASSET_TYPE_LABELS,
  ASSET_TYPE_ORDER,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

const labelCls = "mb-1 block text-xs font-medium text-zinc-500";
const selectCls = cn(inputClass, "min-w-[8.5rem]");

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("it_staff", "admin");
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : undefined;

  const filter = {
    q: str(sp.q)?.trim() || undefined,
    status: pick(sp.status, ASSET_STATUS_ORDER),
    type: pick(sp.type, ASSET_TYPE_ORDER),
  };
  const assets = await listAssets(filter);
  const hasFilters = Boolean(filter.q || filter.status || filter.type);

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Hardware inventory and assignments."
        action={
          <Link href="/assets/new" className={btnPrimary}>
            Add asset
          </Link>
        }
      />

      <form method="get" action="/assets" className="mb-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[12rem] grow">
          <label className={labelCls} htmlFor="q">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={filter.q ?? ""}
            placeholder="Tag, name or serial…"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue={filter.status ?? ""} className={selectCls}>
            <option value="">All statuses</option>
            {ASSET_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {ASSET_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="type">
            Type
          </label>
          <select id="type" name="type" defaultValue={filter.type ?? ""} className={selectCls}>
            <option value="">All types</option>
            {ASSET_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {ASSET_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary}>
            Filter
          </button>
          <Link href="/assets" className={btnSecondary}>
            Clear
          </Link>
        </div>
      </form>

      {assets.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-2.5 font-medium">Tag</th>
                <th className="px-4 py-2.5 font-medium">Asset</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Condition</th>
                <th className="px-4 py-2.5 font-medium">Assigned to</th>
                <th className="px-4 py-2.5 font-medium">Warranty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-zinc-50/70">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/assets/${a.id}`}
                      className="font-mono text-xs font-medium text-zinc-900 hover:text-teal-700"
                    >
                      {a.assetTag}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-zinc-900">{a.name}</span>
                    <span className="mt-0.5 block">
                      <AssetTypeBadge type={a.type} />
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <AssetStatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <AssetConditionBadge condition={a.condition} />
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600">
                    {a.assignedTo?.name ?? <span className="text-zinc-400">—</span>}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">
                    {a.warrantyExpiresAt ? formatDate(a.warrantyExpiresAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={hasFilters ? "No matching assets" : "No assets yet"}
          description={
            hasFilters
              ? "Try clearing or changing your filters."
              : "Add the first piece of hardware to the inventory."
          }
          action={
            hasFilters ? (
              <Link href="/assets" className={btnSecondary}>
                Clear filters
              </Link>
            ) : (
              <Link href="/assets/new" className={btnPrimary}>
                Add asset
              </Link>
            )
          }
        />
      )}
    </div>
  );
}
