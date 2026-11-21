import type { TooltipProps } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";

import type { SeriesGranularity } from "../../model/calculations";
import { formatLongDate, formatMonthKey, parseISODate } from "../../model/dates";
import { formatCurrency } from "../../model/money";
import { format } from "date-fns";

export const cashflowChartConfig = {
  incomeCents: { label: "Receitas", color: "var(--income)" },
  expenseCents: { label: "Despesas", color: "var(--expense)" },
} satisfies ChartConfig;

export function formatBucketTick(key: string, granularity: SeriesGranularity): string {
  return granularity === "day" ? format(parseISODate(key), "dd/MM") : formatMonthKey(key, "MMM/yy");
}

export function formatBucketTitle(key: string, granularity: SeriesGranularity): string {
  return granularity === "day" ? formatLongDate(key) : formatMonthKey(key, "MMMM 'de' yyyy");
}

interface MoneyTooltipProps extends TooltipProps<number, string> {
  config: ChartConfig;
  formatTitle?: (label: string) => string;
}

export function MoneyTooltip({ active, payload, label, config, formatTitle }: MoneyTooltipProps) {
  if (!active || !payload?.length) return null;
  const title = typeof label === "string" && formatTitle ? formatTitle(label) : label;

  return (
    <div className="min-w-44 rounded-2xl border border-border bg-popover px-3 py-2.5 text-xs shadow-float">
      {title !== undefined && title !== "" && (
        <p className="mb-1.5 font-semibold text-foreground first-letter:uppercase">{title}</p>
      )}
      <ul className="flex flex-col gap-1">
        {payload.map((item) => {
          const key = String(item.name ?? item.dataKey ?? "");
          const entry = config[key];
          return (
            <li key={key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color ?? entry?.color }}
                />
                {entry?.label ?? item.name}
              </span>
              <span className="tabular font-semibold text-foreground">
                {formatCurrency(Number(item.value ?? 0))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
