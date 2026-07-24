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
  Home,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { MonthlyAuditsChart } from "@/components/dashboard/charts/MonthlyAuditsChart";
import { SavingsTrendChart } from "@/components/dashboard/charts/SavingsTrendChart";
import { UpgradeCategoriesChart } from "@/components/dashboard/charts/UpgradeCategoriesChart";
import { NeighborhoodProgressChart } from "@/components/dashboard/charts/NeighborhoodProgressChart";
import { createClient } from "@/lib/supabase/server";
import { MOCK_DASHBOARD_SUMMARY } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Dashboard" };

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const number = (n: number) => n.toLocaleString("en-US");

// TODO(data): replace MOCK_DASHBOARD_SUMMARY with a Supabase aggregate query
// once audits exist (sum(calculations->>'gallonsSavedPerYear'), etc.)
export default async function DashboardPage() {
  const s = MOCK_DASHBOARD_SUMMARY;

  const supabase = await createClient();
  const { count: homesAudited } = await supabase
    .from("audits")
    .select("id", { count: "exact", head: true })
    .in("status", ["completed", "reviewed"]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Program-wide progress across the water conservation audit project.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-2 px-4 py-2">
            <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
              <Home className="size-6" />
            </div>
            <div className="text-3xl font-semibold tabular-nums">{number(homesAudited ?? 0)}</div>
            <div className="text-muted-foreground text-xs">Homes audited</div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Est. annual water savings"
            value={`${number(Math.round(s.estimatedAnnualGallonsSaved / 1000))}k gal`}
            icon={Droplets}
          />
          <StatCard
            label="Est. annual dollar savings"
            value={currency(s.estimatedAnnualDollarSavings)}
            icon={DollarSign}
            accent="success"
          />
          <StatCard
            label="Avg. savings per home"
            value={currency(s.averageSavingsPerHome)}
            icon={Gauge}
          />
          <StatCard
            label="Total rebate opportunities"
            value={currency(s.totalRebateOpportunities)}
            icon={Wallet}
            accent="success"
          />
          <StatCard
            label="Homes with smart controllers"
            value={number(s.homesWithSmartControllers)}
            icon={Radio}
          />
          <StatCard
            label="Efficient toilets installed"
            value={number(s.efficientToiletsInstalled)}
            icon={ToyBrick}
          />
          <StatCard
            label="Efficient showerheads"
            value={number(s.efficientShowerheadsInstalled)}
            icon={ShowerHead}
          />
          <StatCard
            label="Leak repairs"
            value={number(s.leakRepairs)}
            icon={Wrench}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly audits</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyAuditsChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade categories</CardTitle>
          </CardHeader>
          <CardContent>
            <UpgradeCategoriesChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Neighborhood progress</CardTitle>
          </CardHeader>
          <CardContent>
            <NeighborhoodProgressChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
