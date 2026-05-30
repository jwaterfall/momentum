"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type ChartPoint = { label: string; value: number };

type StatBarChartProps = {
  data: ChartPoint[];
  valueLabel: string;
  layout?: "horizontal" | "vertical";
};

export function StatBarChart({ data, valueLabel, layout = "horizontal" }: StatBarChartProps) {
  const config = {
    value: { label: valueLabel, color: "var(--chart-1)" },
  } satisfies ChartConfig;

  if (layout === "vertical") {
    return (
      <ChartContainer
        config={config}
        style={{ height: Math.max(140, data.length * 44) }}
        className="w-full"
      >
        <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={96}
            tickMargin={8}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={6} />
        </BarChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={config} className="h-[180px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={6} />
      </BarChart>
    </ChartContainer>
  );
}
