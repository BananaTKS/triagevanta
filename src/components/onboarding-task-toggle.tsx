import { toggleOnboardingTaskAction } from "@/lib/actions/onboarding";
import { cn } from "@/lib/cn";

export function OnboardingTaskToggle({
  id,
  label,
  done,
}: {
  id: string;
  label: string;
  done: boolean;
}) {
  return (
    <form action={toggleOnboardingTaskAction}>
      <input type="hidden" name="taskId" value={id} />
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition hover:bg-zinc-50"
      >
        <span
          className={cn(
            "grid h-5 w-5 shrink-0 place-items-center rounded border",
            done ? "border-teal-600 bg-teal-600 text-white" : "border-zinc-300 bg-white",
          )}
        >
          {done && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m5 12 5 5L20 7" />
            </svg>
          )}
        </span>
        <span className={cn("text-sm", done ? "text-zinc-400 line-through" : "text-zinc-700")}>
          {label}
        </span>
      </button>
    </form>
  );
}
