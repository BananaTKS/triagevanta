import Link from "next/link";
import { Card } from "@/components/ui";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-1 text-lg font-semibold text-zinc-900">Sign in</h2>
      <p className="mb-5 text-sm text-zinc-500">
        Welcome back. Sign in to your TriageVanta account.
      </p>

      <LoginForm />

      <p className="mt-5 text-center text-sm text-zinc-500">
        New here?{" "}
        <Link href="/register" className="font-medium text-teal-700 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500">
        <p className="mb-1 font-semibold text-zinc-600">Demo accounts</p>
        <p className="font-mono text-[11px]">
          admin@triagevanta.dev · it@triagevanta.dev · employee@triagevanta.dev
        </p>
        <p className="mt-1">
          Password: <code className="font-mono text-zinc-700">Password123!</code>
        </p>
      </div>
    </Card>
  );
}
