import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/forms/SignupForm";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">Create account</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        For EcoWise auditors and staff only.
      </p>
      <SignupForm />
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
