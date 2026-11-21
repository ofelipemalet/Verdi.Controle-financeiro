import { useId } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/ui/chart";

import type { CashflowSeries } from "../../model/calculations";
import { formatCompactCurrency } from "../../model/money";
import {
  MoneyTooltip,
  cashflowChartConfig,
  formatBucketTick,
  formatBucketTitle,
} from "./chart-utils";

interface CashflowAreaChartProps {
  series: CashflowSeries;
}

export function CashflowAreaChart({ series }: CashflowAreaChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const { granularity, points } = series;

  return (
    <ChartContainer config={cashflowChartConfig} className="aspect-auto h-64 w-full">
      <AreaChart data={points} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          {(["incomeCents", "expenseCents"] as const).map((key) => (
            <linearGradient key={key} id={`${gradientId}-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`var(--color-${key})`} stopOpacity={0.28} />
              <stop offset="100%" stopColor={`var(--color-${key})`} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis
          dataKey="key"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={24}
          tickFormatter={(key: string) => formatBucketTick(key, granularity)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={72}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
        />
        <Tooltip
          cursor={{ strokeDasharray: "4 4" }}
          content={
            <MoneyTooltip
              config={cashflowChartConfig}
              formatTitle={(key) => formatBucketTitle(key, granularity)}
            />
          }
        />
        {(["incomeCents", "expenseCents"] as const).map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            stroke={`var(--color-${key})`}
            strokeWidth={2.25}
            fill={`url(#${gradientId}-${key})`}
            animationDuration={600}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
