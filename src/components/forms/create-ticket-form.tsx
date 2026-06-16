"use client";

import { useActionState } from "react";
import { createTicketAction } from "@/lib/actions/tickets";
import { EMPTY_FORM_STATE } from "@/lib/form";
import { SubmitButton } from "@/components/submit-button";
import { FieldError, inputClass, labelClass } from "@/components/ui";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
} from "@/lib/constants";

export function CreateTicketForm() {
  const [state, action] = useActionState(createTicketAction, EMPTY_FORM_STATE);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
          {state.error}
        </p>
      )}
      <div>
        <label className={labelClass} htmlFor="title">
          Title
        </label>
        <input
          className={inputClass}
          id="title"
          name="title"
          placeholder="e.g. Cannot connect to office WiFi"
          required
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="category">
            Category
          </label>
          <select
            className={inputClass}
            id="category"
            name="category"
            defaultValue="other"
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="priority">
            Priority
          </label>
          <select
            className={inputClass}
            id="priority"
            name="priority"
            defaultValue="medium"
          >
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea
          className={inputClass}
          id="description"
          name="description"
          rows={5}
          placeholder="Describe the issue, what you have tried, and any error messages."
          required
        />
        <FieldError messages={state.fieldErrors?.description} />
      </div>
      <SubmitButton pendingText="Submitting…">Submit ticket</SubmitButton>
    </form>
  );
}
