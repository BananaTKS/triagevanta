"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/dal";
import { createSession, deleteSession } from "@/lib/session";
import { logSecurityEvent } from "@/lib/audit";
import { LoginSchema, SignupSchema } from "@/lib/validation";
import type { FormState } from "@/lib/form";

// Fixed-cost comparison target so a missing user takes the same time as a wrong
// password — avoids leaking which emails are registered (timing/enumeration).
const DUMMY_HASH = bcrypt.hashSync("triagevanta-dummy-password", 10);

export async function signupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: "employee" })
    .returning({ id: users.id, role: users.role });

  if (!user) {
    return { error: "Could not create the account. Please try again." };
  }

  await logSecurityEvent({ type: "user_created", actorId: user.id, targetEmail: email });
  await logSecurityEvent({ type: "login_success", actorId: user.id, targetEmail: email });
  await createSession(user.id, user.role);
  redirect("/dashboard");
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter your email and password." };
  }

  const { email, password } = parsed.data;
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordOk) {
    await logSecurityEvent({
      type: "login_failure",
      actorId: user?.id ?? null,
      targetEmail: email,
      metadata: { reason: user ? "bad_password" : "unknown_email" },
    });
    return { error: "Invalid email or password." };
  }

  await logSecurityEvent({ type: "login_success", actorId: user.id, targetEmail: email });
  await createSession(user.id, user.role);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  if (session) {
    await logSecurityEvent({ type: "logout", actorId: session.userId });
  }
  await deleteSession();
  redirect("/login");
}
