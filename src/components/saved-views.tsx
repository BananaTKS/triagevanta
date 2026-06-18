import Link from "next/link";
import { deleteViewAction, saveViewAction } from "@/lib/actions/views";
import { cn } from "@/lib/cn";

export function SavedViews({
  views,
  currentParams,
}: {
  views: { id: string; name: string; params: string }[];
  currentParams: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-zinc-500">Saved views</span>

      {views.map((v) => {
        const active = v.params === currentParams;
        return (
          <span
            key={v.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs",
              active
                ? "border-teal-300 bg-teal-50 text-teal-800"
                : "border-zinc-300 bg-white text-zinc-700",
            )}
          >
            <Link
              href={v.params ? `/tickets?${v.params}` : "/tickets"}
              className="hover:underline"
            >
              {v.name}
            </Link>
            <form action={deleteViewAction} className="flex">
              <input type="hidden" name="viewId" value={v.id} />
              <button
                type="submit"
                aria-label={`Delete ${v.name}`}
                className="leading-none text-zinc-400 hover:text-rose-600"
              >
                ×
              </button>
            </form>
          </span>
        );
      })}

      <form action={saveViewAction} className="flex items-center gap-1">
        <input type="hidden" name="params" value={currentParams} />
        <input
          name="name"
          required
          maxLength={40}
          placeholder="Save current as…"
          className="h-7 w-36 rounded-md border border-zinc-300 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
        />
        <button
          type="submit"
          className="h-7 rounded-md bg-zinc-900 px-2.5 text-xs font-medium text-white hover:bg-zinc-800"
        >
          Save
        </button>
      </form>
    </div>
  );
}
