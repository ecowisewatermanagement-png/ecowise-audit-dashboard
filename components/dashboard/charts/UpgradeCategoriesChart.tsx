"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MOCK_UPGRADE_CATEGORIES } from "@/lib/mock-data";

const config = {
  count: { label: "Installed", color: "var(--color-chart-3)" },
} satisfies ChartConfig;

export function UpgradeCategoriesChart() {
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={MOCK_UPGRADE_CATEGORIES} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis
          dataKey="category"
          type="category"
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
