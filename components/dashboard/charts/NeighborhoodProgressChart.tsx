"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MOCK_NEIGHBORHOOD_PROGRESS } from "@/lib/mock-data";

const config = {
  audited: { label: "Audited", color: "var(--color-chart-1)" },
  remaining: { label: "Remaining", color: "var(--color-chart-5)" },
} satisfies ChartConfig;

const data = MOCK_NEIGHBORHOOD_PROGRESS.map((n) => ({
  neighborhood: n.neighborhood,
  audited: n.audited,
  remaining: n.total - n.audited,
}));

export function NeighborhoodProgressChart() {
  return (
    <ChartContainer config={config} className="h-72 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis
          dataKey="neighborhood"
          type="category"
          tickLine={false}
          axisLine={false}
          width={140}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="audited"
          stackId="a"
          fill="var(--color-audited)"
          radius={[4, 0, 0, 4]}
        />
        <Bar
          dataKey="remaining"
          stackId="a"
          fill="var(--color-remaining)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
