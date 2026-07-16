import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCommunityForm } from "@/components/community/CreateCommunityForm";
import { InviteClientForm } from "@/components/community/InviteClientForm";
import { CommunityList } from "@/components/community/CommunityList";
import { PendingClientRequests } from "@/components/community/PendingClientRequests";

export const metadata: Metadata = { title: "Communities" };

export default async function CommunitiesPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: communities }, { data: access }, { data: pending }] = await Promise.all([
    supabase.from("communities").select("*").order("name"),
    supabase.from("community_access").select("user_id, community_id"),
    supabase
      .from("profiles")
      .select("id, full_name, email, requested_community, client_type, home_address")
      .eq("role", "client")
      .not("requested_community", "is", null)
      .order("created_at"),
  ]);

  const userIds = Array.from(new Set((access ?? []).map((a) => a.user_id)));
  const { data: clientProfiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, client_type, home_address")
        .in("id", userIds)
    : { data: [] };

  const profileById = new Map((clientProfiles ?? []).map((p) => [p.id, p]));

  const communitiesWithClients = (communities ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    goalHomes: c.goal_homes,
    clients: (access ?? [])
      .filter((a) => a.community_id === c.id)
      .map((a) => {
        const profile = profileById.get(a.user_id);
        return {
          userId: a.user_id,
          fullName: profile?.full_name ?? null,
          email: profile?.email ?? null,
          clientType: profile?.client_type ?? null,
          homeAddress: profile?.home_address ?? null,
        };
      }),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Communities</h1>
        <p className="text-muted-foreground text-sm">
          Manage the developments you audit and which clients can see each
          one&apos;s dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending community sign-ups</CardTitle>
        </CardHeader>
        <CardContent>
          <PendingClientRequests
            requests={(pending ?? []).map((p) => ({
              userId: p.id,
              fullName: p.full_name,
              email: p.email,
              requestedCommunity: p.requested_community!,
              clientType: p.client_type,
              homeAddress: p.home_address,
            }))}
            communities={(communities ?? []).map((c) => ({ id: c.id, name: c.name }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a community</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCommunityForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invite a client directly</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteClientForm
            communities={(communities ?? []).map((c) => ({ id: c.id, name: c.name }))}
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">All communities</h2>
        <CommunityList communities={communitiesWithClients} />
      </div>
    </div>
  );
}
