"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/actions/auth";
import { EMPTY_FORM_STATE } from "@/lib/form";
import { SubmitButton } from "@/components/submit-button";
import { FieldError, inputClass, labelClass } from "@/components/ui";

export function SignupForm() {
  const [state, action] = useActionState(signupAction, EMPTY_FORM_STATE);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
          {state.error}
        </p>
      )}
      <div>
        <label className={labelClass} htmlFor="name">
          Full name
        </label>
        <input className={inputClass} id="name" name="name" required />
        <FieldError messages={state.fieldErrors?.name} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input
          className={inputClass}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <FieldError messages={state.fieldErrors?.email} />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">
          Password
        </label>
        <input
          className={inputClass}
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError messages={state.fieldErrors?.password} />
        <p className="mt-1 text-xs text-zinc-400">
          At least 8 characters, with a letter and a number.
        </p>
      </div>
      <SubmitButton className="w-full" pendingText="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
