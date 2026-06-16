"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { kbArticles, kbArticleVotes } from "@/db/schema";
import { getCurrentUser, requireRole } from "@/lib/dal";
import { ArticleSchema, VoteSchema } from "@/lib/validation";
import type { FormState } from "@/lib/form";

function parseArticle(formData: FormData) {
  return ArticleSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    category: formData.get("category"),
  });
}

export async function createArticleAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("it_staff", "admin");

  const parsed = parseArticle(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const [article] = await db
    .insert(kbArticles)
    .values({ ...parsed.data, authorId: user.id })
    .returning({ id: kbArticles.id });

  if (!article) return { error: "Could not create the article. Please try again." };

  revalidatePath("/kb");
  redirect(`/kb/${article.id}`);
}

export async function updateArticleAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("it_staff", "admin");

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing article id." };

  const parsed = parseArticle(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db
    .update(kbArticles)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(kbArticles.id, id));

  revalidatePath("/kb");
  revalidatePath(`/kb/${id}`);
  redirect(`/kb/${id}`);
}

export async function voteArticleAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();

  const parsed = VoteSchema.safeParse({
    articleId: formData.get("articleId"),
    helpful: formData.get("helpful") === "yes",
  });
  if (!parsed.success) return;

  const { articleId, helpful } = parsed.data;

  // One vote per user per article; re-voting updates the existing vote.
  await db
    .insert(kbArticleVotes)
    .values({ articleId, userId: user.id, helpful })
    .onConflictDoUpdate({
      target: [kbArticleVotes.articleId, kbArticleVotes.userId],
      set: { helpful, createdAt: new Date() },
    });

  revalidatePath(`/kb/${articleId}`);
}
