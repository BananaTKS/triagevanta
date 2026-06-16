import { cn } from "@/lib/cn";

/** TriageVanta wordmark: a triage triangle with a focal point (vantage). */
export function Logo({
  className,
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className={dark ? "text-teal-400" : "text-teal-700"}
      >
        <path
          d="M12 3.5 20.5 19.5H3.5L12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="14.5" r="2.1" fill="currentColor" />
      </svg>
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          dark ? "text-white" : "text-zinc-900",
        )}
      >
        Triage<span className={dark ? "text-teal-300" : "text-teal-700"}>Vanta</span>
      </span>
    </span>
  );
}
