import { PieChart as PieChartIcon } from "lucide-react";

import { Amount } from "@/components/common/Amount";
import { EmptyState } from "@/components/common/StatusViews";

import type { CategoryShare } from "../model/calculations";
import { getCategory } from "../model/categories";
import { formatPercent } from "../model/money";
import { CATEGORY_APPEARANCE } from "./category-appearance";
import { CategoryIcon } from "./CategoryIcon";
import { CategoryDonutChart } from "./charts/CategoryDonutChart";

interface CategoryBreakdownProps {
  shares: readonly CategoryShare[];
  totalCents: number;
}

export function CategoryBreakdown({ shares, totalCents }: CategoryBreakdownProps) {
  if (shares.length === 0) {
    return (
      <EmptyState
        icon={PieChartIcon}
        title="Nenhuma despesa no período"
        description="Quando você registrar despesas, a distribuição por categoria aparecerá aqui."
      />
    );
  }

  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,15rem)_1fr]">
      <CategoryDonutChart shares={shares} totalCents={totalCents} />
      <ul className="flex flex-col gap-3">
        {shares.map(({ categoryId, totalCents: categoryTotal, share }) => (
          <li key={categoryId} className="flex items-center gap-3">
            <CategoryIcon categoryId={categoryId} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate font-medium text-foreground">
                  {getCategory(categoryId).label}
                </span>
                <Amount cents={categoryTotal} className="text-sm font-semibold" />
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${Math.max(share * 100, 2)}%`,
                      backgroundColor: CATEGORY_APPEARANCE[categoryId].color,
                    }}
                  />
                </div>
                <span className="tabular w-12 text-right text-xs text-muted-foreground">
                  {formatPercent(share)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
