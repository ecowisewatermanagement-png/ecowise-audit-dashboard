import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">Sign in</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Water conservation audit dashboard for field auditors and admins.
      </p>
      <LoginForm redirectTo={redirectTo} />
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Community member, no account yet?{" "}
        <Link href="/join" className="text-primary underline">
          Sign up here
        </Link>
      </p>
    </>
  );
}
