"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { assetEvents, assets, users } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { ASSET_STATUS_LABELS } from "@/lib/constants";
import {
  AssetSchema,
  AssetStatusSchema,
  AssignAssetSchema,
} from "@/lib/validation";
import type { FormState } from "@/lib/form";

function parseAsset(formData: FormData) {
  return AssetSchema.safeParse({
    assetTag: formData.get("assetTag"),
    name: formData.get("name"),
    type: formData.get("type"),
    condition: formData.get("condition"),
    serialNumber: formData.get("serialNumber") ?? undefined,
    warranty: formData.get("warranty") ?? undefined,
    notes: formData.get("notes") ?? undefined,
  });
}

export async function createAssetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireRole("it_staff", "admin");

  const parsed = parseAsset(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const existing = await db.query.assets.findFirst({
    where: eq(assets.assetTag, data.assetTag),
    columns: { id: true },
  });
  if (existing) {
    return { error: `Asset tag ${data.assetTag} is already in use.` };
  }

  const [asset] = await db
    .insert(assets)
    .values({
      assetTag: data.assetTag,
      name: data.name,
      type: data.type,
      condition: data.condition,
      serialNumber: data.serialNumber,
      warrantyExpiresAt: data.warranty,
      notes: data.notes,
    })
    .returning({ id: assets.id });

  if (!asset) return { error: "Could not create the asset. Please try again." };

  await db.insert(assetEvents).values({
    assetId: asset.id,
    type: "created",
    actorId: actor.id,
    note: `Created by ${actor.name}`,
  });

  revalidatePath("/assets");
  redirect(`/assets/${asset.id}`);
}

export async function updateAssetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireRole("it_staff", "admin");

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing asset id." };

  const parsed = parseAsset(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const clash = await db.query.assets.findFirst({
    where: and(eq(assets.assetTag, data.assetTag), ne(assets.id, id)),
    columns: { id: true },
  });
  if (clash) {
    return { error: `Asset tag ${data.assetTag} is already in use.` };
  }

  await db
    .update(assets)
    .set({
      assetTag: data.assetTag,
      name: data.name,
      type: data.type,
      condition: data.condition,
      serialNumber: data.serialNumber,
      warrantyExpiresAt: data.warranty,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, id));

  await db.insert(assetEvents).values({
    assetId: id,
    type: "updated",
    actorId: actor.id,
    note: `Details updated by ${actor.name}`,
  });

  revalidatePath("/assets");
  revalidatePath(`/assets/${id}`);
  redirect(`/assets/${id}`);
}

export async function assignAssetAction(formData: FormData): Promise<void> {
  const actor = await requireRole("it_staff", "admin");

  const parsed = AssignAssetSchema.safeParse({
    assetId: formData.get("assetId"),
    assigneeId: formData.get("assigneeId"),
  });
  if (!parsed.success) return;
  const { assetId, assigneeId } = parsed.data;

  if (assigneeId) {
    const assignee = await db.query.users.findFirst({
      where: eq(users.id, assigneeId),
      columns: { id: true, name: true },
    });
    if (!assignee) return;

    await db
      .update(assets)
      .set({ assignedToId: assigneeId, status: "in_use", updatedAt: new Date() })
      .where(eq(assets.id, assetId));

    await db.insert(assetEvents).values({
      assetId,
      type: "assigned",
      actorId: actor.id,
      note: `Assigned to ${assignee.name}`,
    });
  } else {
    await db
      .update(assets)
      .set({ assignedToId: null, status: "spare", updatedAt: new Date() })
      .where(eq(assets.id, assetId));

    await db.insert(assetEvents).values({
      assetId,
      type: "unassigned",
      actorId: actor.id,
      note: "Unassigned (returned to spare pool)",
    });
  }

  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
}

export async function setAssetStatusAction(formData: FormData): Promise<void> {
  const actor = await requireRole("it_staff", "admin");

  const parsed = AssetStatusSchema.safeParse({
    assetId: formData.get("assetId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;
  const { assetId, status } = parsed.data;

  await db
    .update(assets)
    .set({ status, updatedAt: new Date() })
    .where(eq(assets.id, assetId));

  await db.insert(assetEvents).values({
    assetId,
    type: "status_change",
    actorId: actor.id,
    note: `Status set to ${ASSET_STATUS_LABELS[status]}`,
  });

  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
}
