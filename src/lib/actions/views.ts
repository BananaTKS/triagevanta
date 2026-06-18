"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedViews } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { DeleteViewSchema, SaveViewSchema } from "@/lib/validation";

export async function saveViewAction(formData: FormData): Promise<void> {
  const user = await requireRole("it_staff", "admin");

  const parsed = SaveViewSchema.safeParse({
    name: formData.get("name"),
    params: formData.get("params") ?? "",
  });
  if (!parsed.success) return;

  await db.insert(savedViews).values({
    userId: user.id,
    name: parsed.data.name,
    params: parsed.data.params,
  });

  revalidatePath("/tickets");
}

export async function deleteViewAction(formData: FormData): Promise<void> {
  const user = await requireRole("it_staff", "admin");

  const parsed = DeleteViewSchema.safeParse({ viewId: formData.get("viewId") });
  if (!parsed.success) return;

  // Owner-scoped delete.
  await db
    .delete(savedViews)
    .where(and(eq(savedViews.id, parsed.data.viewId), eq(savedViews.userId, user.id)));

  revalidatePath("/tickets");
}
