import { CalendarClock, Flame, Gauge, Hash, PiggyBank, Tag, type LucideIcon } from "lucide-react";

import type { FinancialIndicators } from "../model/calculations";
import { getCategory } from "../model/categories";
import { formatCurrency, formatPercent } from "../model/money";

interface IndicatorTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}

function IndicatorTile({ icon: Icon, label, value, detail }: IndicatorTileProps) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border p-4">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="tabular mt-0.5 break-words font-display text-lg font-semibold text-foreground">
          {value}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

interface IndicatorsGridProps {
  indicators: FinancialIndicators;
}

export function IndicatorsGrid({ indicators }: IndicatorsGridProps) {
  const {
    savingsRate,
    expenseRatio,
    averageDailyExpenseCents,
    largestExpense,
    topExpenseCategory,
    transactionCount,
  } = indicators;

  const tiles: IndicatorTileProps[] = [
    {
      icon: PiggyBank,
      label: "Taxa de economia",
      value: savingsRate === null ? "—" : formatPercent(savingsRate),
      detail: savingsRate === null ? "Sem receitas no período" : "Das receitas foram poupadas",
    },
    {
      icon: Gauge,
      label: "Comprometimento da renda",
      value: expenseRatio === null ? "—" : formatPercent(expenseRatio),
      detail: expenseRatio === null ? "Sem receitas no período" : "Das receitas foram gastas",
    },
    {
      icon: CalendarClock,
      label: "Gasto médio por dia",
      value: formatCurrency(averageDailyExpenseCents),
      detail: "Considerando os dias decorridos",
    },
    {
      icon: Tag,
      label: "Categoria com mais gastos",
      value: topExpenseCategory ? getCategory(topExpenseCategory.categoryId).label : "—",
      detail: topExpenseCategory
        ? `${formatPercent(topExpenseCategory.share)} das despesas`
        : "Sem despesas no período",
    },
    {
      icon: Flame,
      label: "Maior despesa",
      value: largestExpense ? formatCurrency(largestExpense.amountCents) : "—",
      detail: largestExpense ? largestExpense.description : "Sem despesas no período",
    },
    {
      icon: Hash,
      label: "Movimentações",
      value: String(transactionCount),
      detail: transactionCount === 1 ? "Registro no período" : "Registros no período",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {tiles.map((tile) => (
        <IndicatorTile key={tile.label} {...tile} />
      ))}
    </div>
  );
}
