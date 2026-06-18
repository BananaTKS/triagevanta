"use client";

import { btnSecondary } from "@/components/ui";
import { cn } from "@/lib/cn";

export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={cn(btnSecondary, "print:hidden")}
    >
      {label}
    </button>
  );
}
