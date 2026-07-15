import type { Metadata } from "next";
import { Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { MonthlyAuditsChart } from "@/components/dashboard/charts/MonthlyAuditsChart";
import { UpgradeCategoriesChart } from "@/components/dashboard/charts/UpgradeCategoriesChart";
import { NeighborhoodProgressChart } from "@/components/dashboard/charts/NeighborhoodProgressChart";
import { BuilderComparisonChart } from "@/components/dashboard/charts/BuilderComparisonChart";
import { MOCK_ANALYTICS_SUMMARY } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Analytics" };

// TODO(data): every chart here reads from lib/mock-data.ts — swap for
// Supabase aggregate queries (grouped by neighborhood/builder/month) once
// there's real audit data.
export default function AnalyticsPage() {
  const s = MOCK_ANALYTICS_SUMMARY;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Deeper cuts of the program data by neighborhood, builder, and time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Average audit score"
          value={`${s.averageAuditScore} / 100`}
          icon={Target}
        />
        <StatCard
          label="Participation rate"
          value={`${s.participationRatePct}%`}
          icon={TrendingUp}
          accent="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Savings by neighborhood</CardTitle>
          </CardHeader>
          <CardContent>
            <NeighborhoodProgressChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Builder comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <BuilderComparisonChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fixture & controller upgrades</CardTitle>
          </CardHeader>
          <CardContent>
            <UpgradeCategoriesChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly progress</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyAuditsChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
