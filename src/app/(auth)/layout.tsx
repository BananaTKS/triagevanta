import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

const FEATURES = [
  "Role-based access control",
  "SLA-tracked ticketing",
  "Audit log & failed-login alerts",
];

function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-teal-400"
      aria-hidden
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-zinc-900 p-10 lg:flex">
        <Logo dark />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            IT service desk &amp; security monitoring
          </h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            Triage tickets against SLAs, manage access by role, and watch
            authentication events — in one internal tool.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-zinc-300">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="font-mono text-xs text-zinc-500">TriageVanta · internal tools</p>
      </div>

      {/* Form area */}
      <div className="flex items-center justify-center bg-zinc-50 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
