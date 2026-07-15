import { redirect } from "next/navigation";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { UserMenu } from "@/components/layout/UserMenu";
import { ClientNav } from "@/components/client-portal/ClientNav";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "client") redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <Image
          src="/logo/ecowise-logo.png"
          alt="EcoWise Water Management"
          width={180}
          height={40}
          priority
          className="h-8 w-auto"
        />
        <ClientNav clientType={user.clientType} />
        <UserMenu user={user} />
      </header>
      <main className="flex-1 bg-muted/30 p-4 md:p-6">{children}</main>
    </div>
  );
}
