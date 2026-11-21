import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { formatCurrency } from "../model/money";
import { useTransactionDialog } from "./TransactionDialogProvider";

interface BalanceHeroProps {
  balanceCents: number;
}

export function BalanceHero({ balanceCents }: BalanceHeroProps) {
  const { openCreate } = useTransactionDialog();

  return (
    <section
      aria-label="Saldo disponível"
      className="surface-hero animate-rise relative overflow-hidden p-6 md:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-hero-foreground/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-8 h-40 w-40 rounded-full border border-hero-foreground/10"
      />
      <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-hero-muted">Saldo disponível</p>
          <p className="tabular mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {formatCurrency(balanceCents)}
          </p>
          <p className="mt-2 text-xs text-hero-muted">Considera todas as movimentações até hoje</p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex">
          <Button
            variant="hero"
            size="lg"
            aria-label="Adicionar receita"
            onClick={() => openCreate("income")}
          >
            <ArrowDownLeft aria-hidden />
            <span className="sm:hidden">Receita</span>
            <span className="hidden sm:inline">Adicionar receita</span>
          </Button>
          <Button
            variant="hero-ghost"
            size="lg"
            aria-label="Adicionar despesa"
            onClick={() => openCreate("expense")}
          >
            <ArrowUpRight aria-hidden />
            <span className="sm:hidden">Despesa</span>
            <span className="hidden sm:inline">Adicionar despesa</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
