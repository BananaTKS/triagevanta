"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { EMPTY_FORM_STATE } from "@/lib/form";
import { SubmitButton } from "@/components/submit-button";
import { inputClass, labelClass } from "@/components/ui";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, EMPTY_FORM_STATE);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
          {state.error}
        </p>
      )}
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
          autoComplete="current-password"
          required
        />
      </div>
      <SubmitButton className="w-full" pendingText="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
