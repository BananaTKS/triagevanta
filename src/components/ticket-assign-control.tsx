import { assignTicketAction } from "@/lib/actions/tickets";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function TicketAssignControl({
  ticketId,
  assigneeId,
  staff,
}: {
  ticketId: string;
  assigneeId: string | null;
  staff: { id: string; name: string }[];
}) {
  return (
    <form action={assignTicketAction} className="flex items-center gap-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <select
        name="assigneeId"
        defaultValue={assigneeId ?? ""}
        className={inputClass}
        aria-label="Assignee"
      >
        <option value="">Unassigned</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <SubmitButton>Assign</SubmitButton>
    </form>
  );
}
