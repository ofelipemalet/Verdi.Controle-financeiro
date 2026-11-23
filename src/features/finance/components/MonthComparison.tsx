import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Amount } from "@/components/common/Amount";
import { cn } from "@/lib/utils";

import { percentChange, type MonthSummary } from "../model/calculations";
import { formatMonthKey } from "../model/dates";
import { formatCurrency, formatPercent } from "../model/money";

interface ChangeBadgeProps {
  current: number;
  previous: number;
  higherIsBetter: boolean;
}

function ChangeBadge({ current, previous, higherIsBetter }: ChangeBadgeProps) {
  const change = percentChange(current, previous);
  if (change === null || change === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        <Minus className="h-3 w-3" aria-hidden />
        {change === 0 ? "Sem variação" : "Sem base de comparação"}
      </span>
    );
  }
  const isUp = change > 0;
  const isGood = isUp === higherIsBetter;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        isGood ? "bg-income-soft text-income" : "bg-expense-soft text-expense",
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {formatPercent(Math.abs(change))}
    </span>
  );
}

interface MonthComparisonProps {
  months: readonly MonthSummary[];
}

export function MonthComparison({ months }: MonthComparisonProps) {
  const current = months.at(-1);
  const previous = months.at(-2);
  if (!current || !previous) return null;

  const metrics = [
    { label: "Receitas", key: "incomeCents", higherIsBetter: true },
    { label: "Despesas", key: "expenseCents", higherIsBetter: false },
    { label: "Economia", key: "netCents", higherIsBetter: true },
  ] as const;

  const maxValue = Math.max(1, ...months.map((m) => Math.max(m.incomeCents, m.expenseCents)));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, key, higherIsBetter }) => (
          <div key={key} className="rounded-2xl bg-muted/70 p-4">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <Amount
              cents={current[key]}
              tone={key === "netCents" ? "auto" : "neutral"}
              className="mt-1 block font-display text-lg font-semibold"
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <ChangeBadge
                current={current[key]}
                previous={previous[key]}
                higherIsBetter={higherIsBetter}
              />
              {percentChange(current[key], previous[key]) !== null && (
                <span className="text-xs text-muted-foreground">
                  vs. {formatMonthKey(previous.month, "MMM")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {[...months].reverse().map((month) => (
          <li
            key={month.month}
            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-6"
          >
            <div className="flex items-center justify-between sm:w-40">
              <span className="text-sm font-semibold capitalize text-foreground">
                {formatMonthKey(month.month, "MMMM yyyy")}
              </span>
              <Amount
                cents={month.netCents}
                signed
                tone="auto"
                className="text-sm font-semibold sm:hidden"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5" aria-hidden>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-income transition-[width] duration-500"
                  style={{ width: `${(month.incomeCents / maxValue) * 100}%` }}
                />
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-expense transition-[width] duration-500"
                  style={{ width: `${(month.expenseCents / maxValue) * 100}%` }}
                />
              </div>
            </div>
            <p className="tabular text-xs text-muted-foreground sm:w-56 sm:text-right">
              <span className="sr-only">Receitas </span>
              {formatCurrency(month.incomeCents)} · <span className="sr-only">Despesas </span>
              {formatCurrency(month.expenseCents)}
            </p>
            <Amount
              cents={month.netCents}
              signed
              tone="auto"
              className="hidden w-32 text-right text-sm font-semibold sm:block"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
