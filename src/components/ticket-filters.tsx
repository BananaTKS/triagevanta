import Link from "next/link";
import type { TicketFilter } from "@/lib/queries";
import { btnPrimary, btnSecondary, inputClass } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
} from "@/lib/constants";

const labelCls = "mb-1 block text-xs font-medium text-zinc-500";
const selectCls = cn(inputClass, "min-w-[8.5rem]");

export function TicketFilters({
  current,
  staff,
  showAssignee,
}: {
  current: TicketFilter;
  staff: { id: string; name: string }[];
  showAssignee: boolean;
}) {
  return (
    <form method="get" action="/tickets" className="mb-4 flex flex-wrap items-end gap-2">
      <div className="min-w-[12rem] grow">
        <label className={labelCls} htmlFor="q">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={current.q ?? ""}
          placeholder="Search title or description…"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={current.status ?? ""} className={selectCls}>
          <option value="">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls} htmlFor="priority">
          Priority
        </label>
        <select id="priority" name="priority" defaultValue={current.priority ?? ""} className={selectCls}>
          <option value="">All priorities</option>
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls} htmlFor="category">
          Category
        </label>
        <select id="category" name="category" defaultValue={current.category ?? ""} className={selectCls}>
          <option value="">All categories</option>
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      {showAssignee && (
        <div>
          <label className={labelCls} htmlFor="assignee">
            Assignee
          </label>
          <select id="assignee" name="assignee" defaultValue={current.assignee ?? ""} className={selectCls}>
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>
          Filter
        </button>
        <Link href="/tickets" className={btnSecondary}>
          Clear
        </Link>
      </div>
    </form>
  );
}
