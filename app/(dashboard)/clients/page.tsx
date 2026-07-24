import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ClientsTable } from "@/components/community/ClientsTable";
import type { ClientRow } from "@/components/community/ClientsTable";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: clients }, { data: access }, { data: communities }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, client_type, home_address, requested_community, created_at")
      .eq("role", "client")
      .order("created_at", { ascending: false }),
    supabase.from("community_access").select("user_id, community_id"),
    supabase.from("communities").select("id, name"),
  ]);

  const communityNameById = new Map((communities ?? []).map((c) => [c.id, c.name]));
  const communityNamesByUserId = new Map<string, string[]>();
  const communityIdsByUserId = new Map<string, string[]>();
  for (const a of access ?? []) {
    const name = communityNameById.get(a.community_id);
    if (name) {
      const names = communityNamesByUserId.get(a.user_id) ?? [];
      names.push(name);
      communityNamesByUserId.set(a.user_id, names);
    }
    const ids = communityIdsByUserId.get(a.user_id) ?? [];
    ids.push(a.community_id);
    communityIdsByUserId.set(a.user_id, ids);
  }

  const rows: ClientRow[] = (clients ?? []).map((c) => ({
    userId: c.id,
    fullName: c.full_name,
    email: c.email,
    clientType: c.client_type,
    homeAddress: c.home_address,
    communities: communityNamesByUserId.get(c.id) ?? [],
    communityIds: communityIdsByUserId.get(c.id) ?? [],
    pendingRequest: communityNamesByUserId.has(c.id) ? null : c.requested_community,
  }));

  const allCommunities = (communities ?? []).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="text-muted-foreground text-sm">
          Every homeowner and HOA director who has signed up, in one place —
          view their contact info and fix anything they got wrong.
        </p>
      </div>

      <ClientsTable clients={rows} allCommunities={allCommunities} />
    </div>
  );
}
