import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  LineChart,
  PiggyBank,
  Receipt,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { PeriodSelect } from "@/components/common/PeriodSelect";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/StatusViews";
import { Button } from "@/components/ui/button";
import { BalanceHero } from "@/features/finance/components/BalanceHero";
import { CashflowAreaChart } from "@/features/finance/components/charts/CashflowAreaChart";
import { useTransactionDialog } from "@/features/finance/components/TransactionDialogProvider";
import { TransactionList } from "@/features/finance/components/TransactionList";
import { TransactionsBoundary } from "@/features/finance/components/TransactionsBoundary";
import {
  buildCashflowSeries,
  calculateAvailableBalance,
  calculateTotals,
  filterByRange,
  resolveChartRange,
  safeRatio,
} from "@/features/finance/model/calculations";
import {
  DEFAULT_PERIOD,
  formatRangeLabel,
  resolvePeriod,
  toISODate,
  type PeriodKey,
} from "@/features/finance/model/dates";
import { formatPercent } from "@/features/finance/model/money";
import type { Transaction } from "@/features/finance/model/types";

const RECENT_LIMIT = 6;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Verdi" },
      {
        name: "description",
        content:
          "Seu painel financeiro: saldo disponível, receitas, despesas e economia do período.",
      },
      { property: "og:title", content: "Início — Verdi" },
      {
        property: "og:description",
        content:
          "Seu painel financeiro: saldo disponível, receitas, despesas e economia do período.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [period, setPeriod] = useState<PeriodKey>(DEFAULT_PERIOD);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Visão geral"
        title="Olá! Este é o seu resumo"
        actions={<PeriodSelect value={period} onChange={setPeriod} />}
      />
      <TransactionsBoundary>
        {(transactions) => <Dashboard transactions={transactions} period={period} />}
      </TransactionsBoundary>
    </div>
  );
}

interface DashboardProps {
  transactions: Transaction[];
  period: PeriodKey;
}

function Dashboard({ transactions, period }: DashboardProps) {
  const { openCreate } = useTransactionDialog();
  const today = useMemo(() => new Date(), []);

  const data = useMemo(() => {
    const todayISO = toISODate(today);
    const range = resolvePeriod(period, today);
    const periodTransactions = filterByRange(transactions, range);
    const chartRange = resolveChartRange(range, transactions, todayISO);
    return {
      range,
      balanceCents: calculateAvailableBalance(transactions, todayISO),
      totals: calculateTotals(periodTransactions),
      series: chartRange ? buildCashflowSeries(periodTransactions, chartRange) : null,
      hasPeriodActivity: periodTransactions.length > 0,
      recent: transactions.filter((t) => t.date <= todayISO).slice(0, RECENT_LIMIT),
    };
  }, [transactions, period, today]);

  const savingsRate = safeRatio(data.totals.netCents, data.totals.incomeCents);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <BalanceHero balanceCents={data.balanceCents} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          label="Receitas"
          cents={data.totals.incomeCents}
          icon={ArrowDownLeft}
          tone="income"
          hint="Entradas no período"
        />
        <StatCard
          label="Despesas"
          cents={data.totals.expenseCents}
          icon={ArrowUpRight}
          tone="expense"
          hint="Saídas no período"
        />
        <StatCard
          label="Economizado"
          className="col-span-2 sm:col-span-1"
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

      <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
        <SectionCard
          title="Movimentações"
          description={data.range ? formatRangeLabel(data.range) : "Todo o período"}
          className="lg:col-span-3"
        >
          {data.series && data.hasPeriodActivity ? (
            <CashflowAreaChart series={data.series} />
          ) : (
            <EmptyState
              icon={LineChart}
              title="Sem movimentações no período"
              description="Adicione receitas e despesas para acompanhar a evolução aqui."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Últimas transações"
          className="lg:col-span-2"
          action={
            data.recent.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="-mr-2 text-primary">
                <Link to="/movimentacoes">
                  Ver todas
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            )
          }
        >
          {data.recent.length > 0 ? (
            <TransactionList transactions={data.recent} today={today} />
          ) : (
            <EmptyState
              icon={Receipt}
              title="Nenhuma transação ainda"
              description="Comece registrando sua primeira receita ou despesa."
              action={
                <Button variant="soft" size="sm" onClick={() => openCreate("expense")}>
                  Adicionar despesa
                </Button>
              }
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
