import type { AssetStatus } from "@/db/schema";
import { setAssetStatusAction } from "@/lib/actions/assets";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui";
import { ASSET_STATUS_LABELS, ASSET_STATUS_ORDER } from "@/lib/constants";

export function AssetStatusControl({
  assetId,
  status,
}: {
  assetId: string;
  status: AssetStatus;
}) {
  return (
    <form action={setAssetStatusAction} className="flex items-center gap-2">
      <input type="hidden" name="assetId" value={assetId} />
      <select
        name="status"
        defaultValue={status}
        className={inputClass}
        aria-label="Status"
      >
        {ASSET_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {ASSET_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <SubmitButton>Update</SubmitButton>
    </form>
  );
}
