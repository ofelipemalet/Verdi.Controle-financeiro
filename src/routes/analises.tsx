import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, BarChart3, PiggyBank } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { PeriodSelect } from "@/components/common/PeriodSelect";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/StatusViews";
import { CategoryBreakdown } from "@/features/finance/components/CategoryBreakdown";
import { IncomeExpenseBarChart } from "@/features/finance/components/charts/IncomeExpenseBarChart";
import { IndicatorsGrid } from "@/features/finance/components/IndicatorsGrid";
import { MonthComparison } from "@/features/finance/components/MonthComparison";
import { TransactionsBoundary } from "@/features/finance/components/TransactionsBoundary";
import {
  buildCashflowSeries,
  buildMonthlySummaries,
  calculateIndicators,
  calculateTotals,
  filterByRange,
  getDataExtent,
  groupByCategory,
  safeRatio,
} from "@/features/finance/model/calculations";
import {
  DEFAULT_PERIOD,
  formatRangeLabel,
  resolvePeriod,
  type PeriodKey,
} from "@/features/finance/model/dates";
import { formatPercent } from "@/features/finance/model/money";
import type { Transaction } from "@/features/finance/model/types";

const COMPARISON_MONTHS = 6;

export const Route = createFileRoute("/analises")({
  head: () => ({
    meta: [
      { title: "Análises — Verdi" },
      {
        name: "description",
        content:
          "Receitas versus despesas, comparação entre meses, gastos por categoria e indicadores.",
      },
      { property: "og:title", content: "Análises — Verdi" },
      {
        property: "og:description",
        content:
          "Receitas versus despesas, comparação entre meses, gastos por categoria e indicadores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodKey>(DEFAULT_PERIOD);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Análises"
        title="Como seu dinheiro se movimenta"
        actions={<PeriodSelect value={period} onChange={setPeriod} />}
      />
      <TransactionsBoundary>
        {(transactions) => <Analytics transactions={transactions} period={period} />}
      </TransactionsBoundary>
    </div>
  );
}

interface AnalyticsProps {
  transactions: Transaction[];
  period: PeriodKey;
}

function Analytics({ transactions, period }: AnalyticsProps) {
  const today = useMemo(() => new Date(), []);

  const data = useMemo(() => {
    const range = resolvePeriod(period, today);
    const periodTransactions = filterByRange(transactions, range);
    const chartRange = range ?? getDataExtent(transactions);
    return {
      range,
      totals: calculateTotals(periodTransactions),
      series: chartRange ? buildCashflowSeries(periodTransactions, chartRange) : null,
      hasActivity: periodTransactions.length > 0,
      categoryShares: groupByCategory(periodTransactions, "expense"),
      months: buildMonthlySummaries(transactions, today, COMPARISON_MONTHS),
      indicators: calculateIndicators(periodTransactions, range, today),
    };
  }, [transactions, period, today]);

  const savingsRate = safeRatio(data.totals.netCents, data.totals.incomeCents);
  const rangeLabel = data.range ? formatRangeLabel(data.range) : "Todo o período";

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Entrou"
          cents={data.totals.incomeCents}
          icon={ArrowDownLeft}
          tone="income"
          hint={rangeLabel}
        />
        <StatCard
          label="Saiu"
          cents={data.totals.expenseCents}
          icon={ArrowUpRight}
          tone="expense"
          hint={rangeLabel}
        />
        <StatCard
          label="Economizado"
          cents={data.totals.netCents}
          icon={PiggyBank}
          tone="savings"
          hint={
            savingsRate === null
              ? "Sem receitas no período"
              : `${formatPercent(savingsRate)} das receitas`
          }
        />
      </div>

      <SectionCard title="Receitas x Despesas" description={rangeLabel}>
        {data.series && data.hasActivity ? (
          <IncomeExpenseBarChart series={data.series} />
        ) : (
          <EmptyState
            icon={BarChart3}
            title="Sem movimentações no período"
            description="Escolha outro período ou registre novas movimentações."
          />
        )}
      </SectionCard>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-2">
        <SectionCard title="Gastos por categoria" description={rangeLabel}>
          <CategoryBreakdown shares={data.categoryShares} totalCents={data.totals.expenseCents} />
        </SectionCard>
        <SectionCard title="Indicadores de desempenho" description={rangeLabel}>
          <IndicatorsGrid indicators={data.indicators} />
        </SectionCard>
      </div>

      <SectionCard
        title="Comparação entre meses"
        description={`Últimos ${COMPARISON_MONTHS} meses, do mais recente ao mais antigo`}
      >
        <MonthComparison months={data.months} />
      </SectionCard>
    </div>
  );
}
