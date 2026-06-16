import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { listArticles } from "@/lib/queries";
import { canManageKb } from "@/lib/rbac";
import {
  btnPrimary,
  btnSecondary,
  Card,
  EmptyState,
  inputClass,
  PageHeader,
} from "@/components/ui";
import { CategoryBadge } from "@/components/badges";
import { formatDate } from "@/lib/format";

export default async function KbPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  const sp = await searchParams;
  const q = typeof sp.q === "string" && sp.q.trim() ? sp.q.trim() : undefined;
  const articles = await listArticles(q);
  const manage = canManageKb(user.role);

  return (
    <div>
      <PageHeader
        title="Knowledge base"
        description="Guides and answers for common issues."
        action={
          manage ? (
            <Link href="/kb/new" className={btnPrimary}>
              New article
            </Link>
          ) : undefined
        }
      />

      <form method="get" action="/kb" className="mb-4 flex gap-2">
        <div className="grow">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search articles…"
            className={inputClass}
          />
        </div>
        <button type="submit" className={btnPrimary}>
          Search
        </button>
        {q && (
          <Link href="/kb" className={btnSecondary}>
            Clear
          </Link>
        )}
      </form>

      {articles.length > 0 ? (
        <div className="space-y-2">
          {articles.map((a) => (
            <Link key={a.id} href={`/kb/${a.id}`} className="block">
              <Card className="p-4 transition hover:border-zinc-300 hover:bg-zinc-50/60">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-medium text-zinc-900">{a.title}</h2>
                  <CategoryBadge category={a.category} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{a.body}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  By {a.author.name} · Updated {formatDate(a.updatedAt)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title={q ? "No matching articles" : "No articles yet"}
          description={
            q
              ? "Try a different search term."
              : manage
                ? "Create the first knowledge base article."
                : "Check back later."
          }
          action={
            q ? (
              <Link href="/kb" className={btnSecondary}>
                Clear search
              </Link>
            ) : manage ? (
              <Link href="/kb/new" className={btnPrimary}>
                New article
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
