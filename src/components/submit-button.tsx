"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { btnPrimary } from "@/components/ui";
import { cn } from "@/lib/cn";

export function SubmitButton({
  children,
  className,
  pendingText,
}: {
  children: ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(btnPrimary, className)}>
      {pending ? (pendingText ?? "Working…") : children}
    </button>
  );
}
