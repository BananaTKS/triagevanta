/** Shared shape returned by form server actions used with `useActionState`. */
export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export const EMPTY_FORM_STATE: FormState = {};
