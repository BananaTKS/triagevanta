"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { onboardings, onboardingTasks } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { ONBOARDING_TEMPLATE } from "@/lib/onboarding-template";
import { CreateOnboardingSchema, ToggleTaskSchema } from "@/lib/validation";
import type { FormState } from "@/lib/form";

export async function createOnboardingAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("it_staff", "admin");

  const parsed = CreateOnboardingSchema.safeParse({
    employeeName: formData.get("employeeName"),
    title: formData.get("title") ?? undefined,
    startDate: formData.get("startDate") ?? undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { employeeName, title, startDate } = parsed.data;
  const [onboarding] = await db
    .insert(onboardings)
    .values({ employeeName, title, startDate, createdById: user.id })
    .returning({ id: onboardings.id });

  if (!onboarding) {
    return { error: "Could not create the onboarding. Please try again." };
  }

  // Apply the default checklist template.
  await db.insert(onboardingTasks).values(
    ONBOARDING_TEMPLATE.map((t, i) => ({
      onboardingId: onboarding.id,
      category: t.category,
      label: t.label,
      sortOrder: i,
    })),
  );

  revalidatePath("/onboarding");
  redirect(`/onboarding/${onboarding.id}`);
}

export async function toggleOnboardingTaskAction(
  formData: FormData,
): Promise<void> {
  await requireRole("it_staff", "admin");

  const parsed = ToggleTaskSchema.safeParse({ taskId: formData.get("taskId") });
  if (!parsed.success) return;

  const task = await db.query.onboardingTasks.findFirst({
    where: eq(onboardingTasks.id, parsed.data.taskId),
    columns: { id: true, done: true, onboardingId: true },
  });
  if (!task) return;

  await db
    .update(onboardingTasks)
    .set({ done: !task.done, doneAt: !task.done ? new Date() : null })
    .where(eq(onboardingTasks.id, task.id));

  await db
    .update(onboardings)
    .set({ updatedAt: new Date() })
    .where(eq(onboardings.id, task.onboardingId));

  revalidatePath(`/onboarding/${task.onboardingId}`);
}
