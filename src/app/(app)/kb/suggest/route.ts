import { getCurrentUser } from "@/lib/dal";
import { suggestArticles } from "@/lib/queries";

// GET /kb/suggest?q=... — top matching KB articles for live ticket suggestions.
export async function GET(request: Request) {
  await getCurrentUser();
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) return Response.json([]);

  const articles = await suggestArticles(q);
  return Response.json(articles);
}
