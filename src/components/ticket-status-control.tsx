import type { TicketStatus } from "@/db/schema";
import { updateStatusAction } from "@/lib/actions/tickets";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";

export function TicketStatusControl({
  ticketId,
  status,
}: {
  ticketId: string;
  status: TicketStatus;
}) {
  return (
    <form action={updateStatusAction} className="flex items-center gap-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <select
        name="status"
        defaultValue={status}
        className={inputClass}
        aria-label="Ticket status"
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <SubmitButton>Update</SubmitButton>
    </form>
  );
}
