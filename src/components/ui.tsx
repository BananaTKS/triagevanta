import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Shared form control classes.
export const inputClass =
  "block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";
export const labelClass = "mb-1 block text-sm font-medium text-zinc-700";

// Buttons — near-black primary, hairline secondary (no indigo, no heavy shadow).
export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border border-zinc-200 bg-white", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
      {children}
    </h2>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>
        {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

type Tone = "default" | "warning" | "danger" | "success";

const TONE_CLASS: Record<Tone, string> = {
  default: "text-zinc-900",
  warning: "text-amber-600",
  danger: "text-rose-600",
  success: "text-emerald-600",
};

export interface Stat {
  label: string;
  value: ReactNode;
  tone?: Tone;
  hint?: string;
}

/** A single bordered, segmented stat strip (not a grid of floating cards). */
export function StatBar({ items }: { items: Stat[] }) {
  return (
    <div className="grid grid-cols-2 divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white sm:grid-cols-4 sm:divide-x">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            "px-4 py-3.5",
            // hairline separators that work in the 2-col mobile layout too
            i % 2 === 1 && "border-l border-zinc-200 sm:border-l-0",
            i >= 2 && "border-t border-zinc-200 sm:border-t-0",
          )}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold tabular-nums",
              TONE_CLASS[item.tone ?? "default"],
            )}
          >
            {item.value}
          </p>
          {item.hint && <p className="mt-0.5 text-xs text-zinc-400">{item.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="mt-1 text-xs text-rose-600">{messages[0]}</p>;
}
