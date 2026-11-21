import { Cell, Pie, PieChart, Tooltip } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

import type { CategoryShare } from "../../model/calculations";
import { getCategory } from "../../model/categories";
import { formatCompactCurrency } from "../../model/money";
import { CATEGORY_APPEARANCE } from "../category-appearance";
import { MoneyTooltip } from "./chart-utils";

interface CategoryDonutChartProps {
  shares: readonly CategoryShare[];
  totalCents: number;
}

export function CategoryDonutChart({ shares, totalCents }: CategoryDonutChartProps) {
  const config: ChartConfig = Object.fromEntries(
    shares.map(({ categoryId }) => [
      categoryId,
      { label: getCategory(categoryId).label, color: CATEGORY_APPEARANCE[categoryId].color },
    ]),
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-60">
      <ChartContainer config={config} className="aspect-square h-full w-full">
        <PieChart>
          <Tooltip content={<MoneyTooltip config={config} />} />
          <Pie
            data={shares.map((share) => ({ ...share }))}
            dataKey="totalCents"
            nameKey="categoryId"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={shares.length > 1 ? 2 : 0}
            cornerRadius={6}
            strokeWidth={0}
            animationDuration={600}
          >
            {shares.map(({ categoryId }) => (
              <Cell key={categoryId} fill={CATEGORY_APPEARANCE[categoryId].color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-muted-foreground">Total gasto</span>
        <span className="tabular font-display text-xl font-semibold text-foreground">
          {formatCompactCurrency(totalCents)}
        </span>
      </div>
    </div>
  );
}
