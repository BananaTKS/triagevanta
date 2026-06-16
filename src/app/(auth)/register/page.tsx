import Link from "next/link";
import { Card } from "@/components/ui";
import { SignupForm } from "@/components/forms/signup-form";

export default function RegisterPage() {
  return (
    <Card className="p-6">
      <h2 className="mb-1 text-lg font-semibold text-zinc-900">Create your account</h2>
      <p className="mb-5 text-sm text-zinc-500">
        New accounts start with the Employee role.
      </p>

      <SignupForm />

      <p className="mt-5 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal-700 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
