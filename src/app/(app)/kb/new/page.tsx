import { requireRole } from "@/lib/dal";
import { Card, PageHeader } from "@/components/ui";
import { ArticleForm } from "@/components/article-form";

export default async function NewArticlePage() {
  await requireRole("it_staff", "admin");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New article"
        description="Add a guide to the knowledge base."
      />
      <Card className="p-6">
        <ArticleForm />
      </Card>
    </div>
  );
}
