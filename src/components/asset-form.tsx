"use client";

import { useActionState } from "react";
import type { Asset } from "@/db/schema";
import { createAssetAction, updateAssetAction } from "@/lib/actions/assets";
import { EMPTY_FORM_STATE } from "@/lib/form";
import { SubmitButton } from "@/components/submit-button";
import { FieldError, inputClass, labelClass } from "@/components/ui";
import {
  ASSET_CONDITION_LABELS,
  ASSET_CONDITION_ORDER,
  ASSET_TYPE_LABELS,
  ASSET_TYPE_ORDER,
} from "@/lib/constants";

export function AssetForm({ asset }: { asset?: Asset }) {
  const [state, action] = useActionState(
    asset ? updateAssetAction : createAssetAction,
    EMPTY_FORM_STATE,
  );

  const warrantyDefault = asset?.warrantyExpiresAt
    ? new Date(asset.warrantyExpiresAt).toISOString().slice(0, 10)
    : "";

  return (
    <form action={action} className="space-y-4">
      {asset && <input type="hidden" name="id" value={asset.id} />}
      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="assetTag">
            Asset tag
          </label>
          <input
            className={inputClass}
            id="assetTag"
            name="assetTag"
            defaultValue={asset?.assetTag}
            placeholder="LAP-001"
            required
          />
          <FieldError messages={state.fieldErrors?.assetTag} />
        </div>
        <div>
          <label className={labelClass} htmlFor="name">
            Name / model
          </label>
          <input
            className={inputClass}
            id="name"
            name="name"
            defaultValue={asset?.name}
            placeholder="Dell Latitude 5440"
            required
          />
          <FieldError messages={state.fieldErrors?.name} />
        </div>
        <div>
          <label className={labelClass} htmlFor="type">
            Type
          </label>
          <select
            className={inputClass}
            id="type"
            name="type"
            defaultValue={asset?.type ?? "laptop"}
          >
            {ASSET_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {ASSET_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="condition">
            Condition
          </label>
          <select
            className={inputClass}
            id="condition"
            name="condition"
            defaultValue={asset?.condition ?? "good"}
          >
            {ASSET_CONDITION_ORDER.map((c) => (
              <option key={c} value={c}>
                {ASSET_CONDITION_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="serialNumber">
            Serial number
          </label>
          <input
            className={inputClass}
            id="serialNumber"
            name="serialNumber"
            defaultValue={asset?.serialNumber ?? ""}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="warranty">
            Warranty expires
          </label>
          <input
            className={inputClass}
            id="warranty"
            name="warranty"
            type="date"
            defaultValue={warrantyDefault}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">
          Notes
        </label>
        <textarea
          className={inputClass}
          id="notes"
          name="notes"
          rows={3}
          defaultValue={asset?.notes ?? ""}
        />
      </div>

      <SubmitButton pendingText="Saving…">
        {asset ? "Save changes" : "Add asset"}
      </SubmitButton>
    </form>
  );
}
