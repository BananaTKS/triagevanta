import { voteArticleAction } from "@/lib/actions/kb";
import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition";
const idle = "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50";

export function ArticleVote({
  articleId,
  helpful,
  notHelpful,
  myVote,
}: {
  articleId: string;
  helpful: number;
  notHelpful: number;
  myVote: boolean | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-zinc-500">Was this article helpful?</span>
      <form action={voteArticleAction}>
        <input type="hidden" name="articleId" value={articleId} />
        <input type="hidden" name="helpful" value="yes" />
        <button
          type="submit"
          className={cn(
            base,
            myVote === true
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : idle,
          )}
        >
          Yes · {helpful}
        </button>
      </form>
      <form action={voteArticleAction}>
        <input type="hidden" name="articleId" value={articleId} />
        <input type="hidden" name="helpful" value="no" />
        <button
          type="submit"
          className={cn(
            base,
            myVote === false ? "border-rose-300 bg-rose-50 text-rose-700" : idle,
          )}
        >
          No · {notHelpful}
        </button>
      </form>
    </div>
  );
}
