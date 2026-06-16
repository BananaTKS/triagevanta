import { assignAssetAction } from "@/lib/actions/assets";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function AssetAssignControl({
  assetId,
  assignedToId,
  users,
}: {
  assetId: string;
  assignedToId: string | null;
  users: { id: string; name: string }[];
}) {
  return (
    <form action={assignAssetAction} className="flex items-center gap-2">
      <input type="hidden" name="assetId" value={assetId} />
      <select
        name="assigneeId"
        defaultValue={assignedToId ?? ""}
        className={inputClass}
        aria-label="Assign to"
      >
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <SubmitButton>Assign</SubmitButton>
    </form>
  );
}
