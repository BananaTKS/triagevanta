"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { logSecurityEvent } from "@/lib/audit";
import { SetRoleSchema } from "@/lib/validation";

export async function setUserRoleAction(formData: FormData): Promise<void> {
  const actor = await requireRole("admin");

  const parsed = SetRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return;

  const { userId, role } = parsed.data;

  // An admin cannot change their own role (prevents locking out the last admin).
  if (userId === actor.id) return;

  const target = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, email: true, role: true },
  });
  if (!target || target.role === role) return;

  await db.update(users).set({ role }).where(eq(users.id, userId));

  await logSecurityEvent({
    type: "role_change",
    actorId: actor.id,
    targetId: target.id,
    targetEmail: target.email,
    metadata: { from: target.role, to: role },
  });

  revalidatePath("/users");
  revalidatePath("/security");
}
