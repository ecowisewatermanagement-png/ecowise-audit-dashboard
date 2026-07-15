import type { Metadata } from "next";
import Link from "next/link";
import { ClientSignupForm } from "@/components/forms/ClientSignupForm";

export const metadata: Metadata = { title: "Community Sign Up" };

export default function JoinPage() {
  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">Community sign up</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        For homeowners and community contacts — see your community&apos;s
        water conservation progress.
      </p>
      <ClientSignupForm />
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
