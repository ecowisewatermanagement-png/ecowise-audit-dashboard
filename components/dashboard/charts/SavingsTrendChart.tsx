"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MOCK_SAVINGS_TREND } from "@/lib/mock-data";

const config = {
  gallons: { label: "Gallons saved (cumulative)", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

export function SavingsTrendChart() {
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <AreaChart data={MOCK_SAVINGS_TREND}>
        <defs>
          <linearGradient id="fillGallons" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-gallons)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-gallons)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `${Number(value).toLocaleString()} gal`}
            />
          }
        />
        <Area
          dataKey="gallons"
          type="monotone"
          fill="url(#fillGallons)"
          stroke="var(--color-gallons)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
