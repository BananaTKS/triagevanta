"use client";

import { useActionState } from "react";
import { createOnboardingAction } from "@/lib/actions/onboarding";
import { EMPTY_FORM_STATE } from "@/lib/form";
import { SubmitButton } from "@/components/submit-button";
import { FieldError, inputClass, labelClass } from "@/components/ui";

export function OnboardingForm() {
  const [state, action] = useActionState(
    createOnboardingAction,
    EMPTY_FORM_STATE,
  );

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
          {state.error}
        </p>
      )}
      <div>
        <label className={labelClass} htmlFor="employeeName">
          Employee name
        </label>
        <input
          className={inputClass}
          id="employeeName"
          name="employeeName"
          placeholder="Jordan Rivera"
          required
        />
        <FieldError messages={state.fieldErrors?.employeeName} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="title">
            Job title
          </label>
          <input
            className={inputClass}
            id="title"
            name="title"
            placeholder="Support Engineer"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="startDate">
            Start date
          </label>
          <input className={inputClass} id="startDate" name="startDate" type="date" />
        </div>
      </div>
      <p className="text-xs text-zinc-400">
        A standard onboarding checklist will be created automatically.
      </p>
      <SubmitButton pendingText="Creating…">Create onboarding</SubmitButton>
    </form>
  );
}
