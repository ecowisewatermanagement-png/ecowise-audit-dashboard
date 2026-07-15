import type { Metadata } from "next";
import {
  Droplets,
  DollarSign,
  Gauge,
  Wrench,
  ShowerHead,
  Radio,
  Wallet,
  ToyBrick,
  Building2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { CommunitySwitcher } from "@/components/client-portal/CommunitySwitcher";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Community Dashboard" };

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const number = (n: number) => Math.round(n).toLocaleString("en-US");

export default async function CommunityPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ community?: string }>;
}) {
  const { community: communityParam } = await searchParams;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: access } = await supabase
    .from("community_access")
    .select("community_id")
    .eq("user_id", user!.id);

  const communityIds = (access ?? []).map((a) => a.community_id);

  const { data: communities } = communityIds.length
    ? await supabase
        .from("communities")
        .select("id, name, goal_homes")
        .in("id", communityIds)
        .order("name")
    : { data: [] };

  if (!communities || communities.length === 0) {
    return (
      <Empty className="rounded-lg border bg-card py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2 />
          </EmptyMedia>
          <EmptyTitle>No community access yet</EmptyTitle>
          <EmptyDescription>
            Your account isn&apos;t linked to a community yet — reach out to
            your EcoWise contact.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const selected =
    communities.find((c) => c.id === communityParam) ?? communities[0];

  const { data: statsRows } = await supabase.rpc("get_community_dashboard", {
    p_community_id: selected.id,
  });
  const stats = statsRows?.[0] ?? {
    homes_audited: 0,
    total_gallons_saved_per_year: 0,
    total_dollar_savings_per_year: 0,
    avg_dollar_savings_per_home: 0,
    avg_efficiency_score: 0,
    homes_with_smart_controllers: 0,
    efficient_toilets_installed: 0,
    efficient_showerheads_installed: 0,
    leak_repairs: 0,
    total_rebate_opportunities: 0,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{selected.name}</h1>
          <p className="text-muted-foreground text-sm">
            Water conservation audit progress for your community.
          </p>
        </div>
        <CommunitySwitcher
          communities={communities.map((c) => ({ id: c.id, name: c.name }))}
          selectedId={selected.id}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="flex items-center justify-center p-6">
          <ProgressRing
            value={stats.homes_audited}
            goal={selected.goal_homes ?? Math.max(stats.homes_audited, 1)}
          />
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Est. annual water savings"
            value={`${number(stats.total_gallons_saved_per_year / 1000)}k gal`}
            icon={Droplets}
          />
          <StatCard
            label="Est. annual dollar savings"
            value={currency(stats.total_dollar_savings_per_year)}
            icon={DollarSign}
            accent="success"
          />
          <StatCard
            label="Avg. savings per home"
            value={currency(stats.avg_dollar_savings_per_home)}
            icon={Gauge}
          />
          <StatCard
            label="Total rebate opportunities"
            value={currency(stats.total_rebate_opportunities)}
            icon={Wallet}
            accent="success"
          />
          <StatCard
            label="Homes with smart controllers"
            value={number(stats.homes_with_smart_controllers)}
            icon={Radio}
          />
          <StatCard
            label="Efficient toilets installed"
            value={number(stats.efficient_toilets_installed)}
            icon={ToyBrick}
          />
          <StatCard
            label="Efficient showerheads"
            value={number(stats.efficient_showerheads_installed)}
            icon={ShowerHead}
          />
          <StatCard
            label="Leak repairs"
            value={number(stats.leak_repairs)}
            icon={Wrench}
          />
        </div>
      </div>
    </div>
  );
}
