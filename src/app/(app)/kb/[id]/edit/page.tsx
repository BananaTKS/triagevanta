import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { getArticle } from "@/lib/queries";
import { Card, PageHeader } from "@/components/ui";
import { ArticleForm } from "@/components/article-form";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("it_staff", "admin");
  const article = await getArticle(id, user.id);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit article" />
      <Card className="p-6">
        <ArticleForm
          article={{
            id: article.id,
            title: article.title,
            body: article.body,
            category: article.category,
          }}
        />
      </Card>
    </div>
  );
}
