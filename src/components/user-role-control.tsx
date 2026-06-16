import type { Role } from "@/db/schema";
import { setUserRoleAction } from "@/lib/actions/users";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui";
import { ROLE_LABELS, ROLE_ORDER } from "@/lib/constants";

export function UserRoleControl({
  userId,
  role,
}: {
  userId: string;
  role: Role;
}) {
  return (
    <form action={setUserRoleAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        className={inputClass}
        aria-label="Role"
      >
        {ROLE_ORDER.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      <SubmitButton>Update</SubmitButton>
    </form>
  );
}
