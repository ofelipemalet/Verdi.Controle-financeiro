import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/ui/chart";

import type { CashflowSeries } from "../../model/calculations";
import { formatCompactCurrency } from "../../model/money";
import {
  MoneyTooltip,
  cashflowChartConfig,
  formatBucketTick,
  formatBucketTitle,
} from "./chart-utils";

interface IncomeExpenseBarChartProps {
  series: CashflowSeries;
}

export function IncomeExpenseBarChart({ series }: IncomeExpenseBarChartProps) {
  const { granularity, points } = series;

  return (
    <ChartContainer config={cashflowChartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={points} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={3}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis
          dataKey="key"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={16}
          tickFormatter={(key: string) => formatBucketTick(key, granularity)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={72}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={
            <MoneyTooltip
              config={cashflowChartConfig}
              formatTitle={(key) => formatBucketTitle(key, granularity)}
            />
          }
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          iconSize={8}
          height={32}
          formatter={(value: string) =>
            value === "incomeCents"
              ? cashflowChartConfig.incomeCents.label
              : cashflowChartConfig.expenseCents.label
          }
        />
        <Bar
          dataKey="incomeCents"
          fill="var(--color-incomeCents)"
          radius={[6, 6, 0, 0]}
          maxBarSize={28}
          animationDuration={600}
        />
        <Bar
          dataKey="expenseCents"
          fill="var(--color-expenseCents)"
          radius={[6, 6, 0, 0]}
          maxBarSize={28}
          animationDuration={600}
        />
      </BarChart>
    </ChartContainer>
  );
}
