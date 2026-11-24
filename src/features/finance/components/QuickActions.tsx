import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, ChartPie, ReceiptText, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useTransactionDialog } from "./TransactionDialogProvider";

const tileClass =
  "press group flex min-w-0 flex-col items-center gap-2 rounded-2xl py-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex-row lg:gap-3 lg:border lg:border-border lg:bg-card lg:p-4 lg:text-left lg:shadow-card lg:hover:border-primary/30";

const iconTones = {
  income: "bg-income-soft text-income",
  expense: "bg-expense-soft text-expense",
  primary: "bg-primary-soft text-primary",
} as const;

interface TileContentProps {
  icon: LucideIcon;
  tone: keyof typeof iconTones;
  label: string;
  detail: string;
}

function TileContent({ icon: Icon, tone, label, detail }: TileContentProps): ReactNode {
  return (
    <>
      <span
        aria-hidden
        className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-card lg:h-auto lg:w-auto lg:border-0 lg:bg-transparent lg:shadow-none"
      >
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-xl lg:h-11 lg:w-11",
            iconTones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-foreground lg:text-sm">
          {label}
        </span>
        <span className="hidden truncate text-xs text-muted-foreground lg:block">{detail}</span>
      </span>
    </>
  );
}

export function QuickActions({ className }: { className?: string }) {
  const { openCreate } = useTransactionDialog();

  return (
    <nav
      aria-label="Atalhos"
      className={cn("animate-rise grid grid-cols-4 gap-2 lg:grid-cols-2 lg:gap-3", className)}
    >
      <button
        type="button"
        aria-label="Adicionar receita"
        onClick={() => openCreate("income")}
        className={tileClass}
      >
        <TileContent
          icon={ArrowDownLeft}
          tone="income"
          label="Receita"
          detail="Nova entrada"
        />
      </button>
      <button
        type="button"
        aria-label="Adicionar despesa"
        onClick={() => openCreate("expense")}
        className={tileClass}
      >
        <TileContent icon={ArrowUpRight} tone="expense" label="Despesa" detail="Nova saída" />
      </button>
      <Link to="/movimentacoes" className={tileClass}>
        <TileContent
          icon={ReceiptText}
          tone="primary"
          label="Extrato"
          detail="Ver histórico"
        />
      </Link>
      <Link to="/analises" className={tileClass}>
        <TileContent
          icon={ChartPie}
          tone="primary"
          label="Análises"
          detail="Ver gráficos"
        />
      </Link>
    </nav>
  );
}
