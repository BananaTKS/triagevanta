"use client";

import { useActionState } from "react";
import type { TicketCategory } from "@/db/schema";
import { createArticleAction, updateArticleAction } from "@/lib/actions/kb";
import { EMPTY_FORM_STATE } from "@/lib/form";
import { SubmitButton } from "@/components/submit-button";
import { FieldError, inputClass, labelClass } from "@/components/ui";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/constants";

export function ArticleForm({
  article,
}: {
  article?: { id: string; title: string; body: string; category: TicketCategory };
}) {
  const [state, action] = useActionState(
    article ? updateArticleAction : createArticleAction,
    EMPTY_FORM_STATE,
  );

  return (
    <form action={action} className="space-y-4">
      {article && <input type="hidden" name="id" value={article.id} />}
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
          defaultValue={article?.title}
          placeholder="e.g. How to connect to the office VPN"
          required
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>
      <div>
        <label className={labelClass} htmlFor="category">
          Category
        </label>
        <select
          className={inputClass}
          id="category"
          name="category"
          defaultValue={article?.category ?? "other"}
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="body">
          Body
        </label>
        <textarea
          className={inputClass}
          id="body"
          name="body"
          rows={12}
          defaultValue={article?.body}
          placeholder="Write the steps or guidance here…"
          required
        />
        <FieldError messages={state.fieldErrors?.body} />
      </div>
      <SubmitButton pendingText="Saving…">
        {article ? "Save changes" : "Publish article"}
      </SubmitButton>
    </form>
  );
}
