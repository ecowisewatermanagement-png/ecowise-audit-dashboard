"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MOCK_MONTHLY_AUDITS } from "@/lib/mock-data";

const config = {
  audits: { label: "Audits", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export function MonthlyAuditsChart() {
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={MOCK_MONTHLY_AUDITS}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="audits" fill="var(--color-audits)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
