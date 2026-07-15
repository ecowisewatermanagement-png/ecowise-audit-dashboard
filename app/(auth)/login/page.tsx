import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">Sign in</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Water conservation audit dashboard for field auditors and admins.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        EcoWise staff, no account yet?{" "}
        <Link href="/signup" className="text-primary underline">
          Create one
        </Link>
      </p>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        Community member?{" "}
        <Link href="/join" className="text-primary underline">
          Sign up here
        </Link>
      </p>
    </>
  );
}
