import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, ListFilter, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Amount } from "@/components/common/Amount";
import { PageHeader } from "@/components/common/PageHeader";
import { PeriodSelect } from "@/components/common/PeriodSelect";
import { SegmentedControl, type SegmentedOption } from "@/components/common/SegmentedControl";
import { EmptyState } from "@/components/common/StatusViews";
import { Button } from "@/components/ui/button";
import { useTransactionDialog } from "@/features/finance/components/TransactionDialogProvider";
import { TransactionList } from "@/features/finance/components/TransactionList";
import { TransactionsBoundary } from "@/features/finance/components/TransactionsBoundary";
import { calculateTotals, filterByRange } from "@/features/finance/model/calculations";
import { resolvePeriod, type PeriodKey } from "@/features/finance/model/dates";
import type { Transaction, TransactionType } from "@/features/finance/model/types";

type TypeFilter = "all" | TransactionType;

const TYPE_FILTER_OPTIONS: readonly SegmentedOption<TypeFilter>[] = [
  { value: "all", label: "Todas" },
  { value: "income", label: "Receitas", tone: "income" },
  { value: "expense", label: "Despesas", tone: "expense" },
];

export const Route = createFileRoute("/_authenticated/movimentacoes")({
  head: () => ({
    meta: [
      { title: "Movimentações — Verdi" },
      {
        name: "description",
        content: "Cadastre, edite, exclua e filtre suas receitas e despesas.",
      },
      { property: "og:title", content: "Movimentações — Verdi" },
      {
        property: "og:description",
        content: "Cadastre, edite, exclua e filtre suas receitas e despesas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { openCreate } = useTransactionDialog();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [period, setPeriod] = useState<PeriodKey>("all");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Movimentações"
        title="Suas receitas e despesas"
        actions={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <Button variant="soft" onClick={() => openCreate("income")}>
              <Plus aria-hidden />
              Nova receita
            </Button>
            <Button onClick={() => openCreate("expense")}>
              <Plus aria-hidden />
              Nova despesa
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          ariaLabel="Filtrar por tipo"
          options={TYPE_FILTER_OPTIONS}
          value={typeFilter}
          onChange={setTypeFilter}
          className="w-full sm:w-auto"
        />
        <PeriodSelect value={period} onChange={setPeriod} className="w-full sm:w-auto" />
      </div>

      <TransactionsBoundary>
        {(transactions) => (
          <FilteredTransactions
            transactions={transactions}
            typeFilter={typeFilter}
            period={period}
          />
        )}
      </TransactionsBoundary>
    </div>
  );
}

interface FilteredTransactionsProps {
  transactions: Transaction[];
  typeFilter: TypeFilter;
  period: PeriodKey;
}

function FilteredTransactions({ transactions, typeFilter, period }: FilteredTransactionsProps) {
  const { openCreate } = useTransactionDialog();
  const today = useMemo(() => new Date(), []);

  const filtered = useMemo(() => {
    const inPeriod = filterByRange(transactions, resolvePeriod(period, today));
    return typeFilter === "all" ? inPeriod : inPeriod.filter((t) => t.type === typeFilter);
  }, [transactions, typeFilter, period, today]);

  const totals = useMemo(() => calculateTotals(filtered), [filtered]);

  if (transactions.length === 0) {
    return (
      <div className="surface-card">
        <EmptyState
          icon={ListFilter}
          title="Nenhuma movimentação cadastrada"
          description="Registre sua primeira receita ou despesa para começar a acompanhar suas finanças."
          action={
            <Button variant="soft" size="sm" onClick={() => openCreate("income")}>
              <Plus aria-hidden />
              Nova receita
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <section className="surface-card animate-rise p-4 md:p-6" aria-label="Lista de movimentações">
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-4 text-sm">
        <span className="font-semibold text-foreground">
          {filtered.length} {filtered.length === 1 ? "movimentação" : "movimentações"}
        </span>
        {typeFilter !== "expense" && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <ArrowDownLeft className="h-4 w-4 text-income" aria-hidden />
            Entradas <Amount cents={totals.incomeCents} className="font-semibold text-foreground" />
          </span>
        )}
        {typeFilter !== "income" && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <ArrowUpRight className="h-4 w-4 text-expense" aria-hidden />
            Saídas <Amount cents={totals.expenseCents} className="font-semibold text-foreground" />
          </span>
        )}
      </div>

      {filtered.length > 0 ? (
        <TransactionList transactions={filtered} today={today} groupByDay />
      ) : (
        <EmptyState
          icon={ListFilter}
          title="Nada encontrado"
          description="Nenhuma movimentação corresponde aos filtros selecionados."
        />
      )}
    </section>
  );
}