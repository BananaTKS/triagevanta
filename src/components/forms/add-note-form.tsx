"use client";

import { useActionState } from "react";
import { addNoteAction } from "@/lib/actions/tickets";
import { EMPTY_FORM_STATE } from "@/lib/form";
import { SubmitButton } from "@/components/submit-button";
import { FieldError, inputClass } from "@/components/ui";

export function AddNoteForm({
  ticketId,
  canPostInternal,
}: {
  ticketId: string;
  canPostInternal: boolean;
}) {
  const [state, action] = useActionState(addNoteAction, EMPTY_FORM_STATE);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
          {state.error}
        </p>
      )}
      <div>
        <textarea
          className={inputClass}
          name="body"
          rows={3}
          placeholder="Add a note or reply…"
          required
        />
        <FieldError messages={state.fieldErrors?.body} />
      </div>
      <div className="flex items-center justify-between">
        {canPostInternal ? (
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              name="isInternal"
              className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
            />
            Internal note (staff only)
          </label>
        ) : (
          <span />
        )}
        <SubmitButton pendingText="Posting…">Post note</SubmitButton>
      </div>
    </form>
  );
}
