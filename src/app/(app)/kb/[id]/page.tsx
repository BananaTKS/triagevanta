import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { getArticle } from "@/lib/queries";
import { canManageKb } from "@/lib/rbac";
import { btnSecondary, Card, PageHeader } from "@/components/ui";
import { CategoryBadge } from "@/components/badges";
import { ArticleVote } from "@/components/article-vote";
import { formatDate } from "@/lib/format";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const article = await getArticle(id, user.id);
  if (!article) notFound();

  const manage = canManageKb(user.role);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/kb" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back to knowledge base
        </Link>
        {manage && (
          <Link href={`/kb/${article.id}/edit`} className={btnSecondary}>
            Edit
          </Link>
        )}
      </div>

      <PageHeader
        title={article.title}
        description={`By ${article.author.name} · Updated ${formatDate(article.updatedAt)}`}
        action={<CategoryBadge category={article.category} />}
      />

      <Card className="p-6">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {article.body}
        </p>
      </Card>

      <div className="mt-5">
        <ArticleVote
          articleId={article.id}
          helpful={article.helpful}
          notHelpful={article.notHelpful}
          myVote={article.myVote}
        />
      </div>
    </div>
  );
}
