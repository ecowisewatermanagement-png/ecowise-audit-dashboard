"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MOCK_BUILDER_COMPARISON } from "@/lib/mock-data";

const config = {
  avgSavings: { label: "Avg. $ savings / home", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

export function BuilderComparisonChart() {
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={MOCK_BUILDER_COMPARISON}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="builder"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="avgSavings" fill="var(--color-avgSavings)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
