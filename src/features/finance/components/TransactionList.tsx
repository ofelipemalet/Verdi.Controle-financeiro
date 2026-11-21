import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { Amount } from "@/components/common/Amount";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getCategory } from "../model/categories";
import { formatDayHeading, formatShortDate } from "../model/dates";
import type { Transaction } from "../model/types";
import { CategoryIcon } from "./CategoryIcon";
import { useTransactionDialog } from "./TransactionDialogProvider";

interface TransactionRowProps {
  transaction: Transaction;
  showDate: boolean;
}

function TransactionRow({ transaction, showDate }: TransactionRowProps) {
  const { openEdit, openDelete } = useTransactionDialog();
  const category = getCategory(transaction.categoryId);
  const isIncome = transaction.type === "income";

  return (
    <li className="group flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-muted/70">
      <CategoryIcon categoryId={transaction.categoryId} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{transaction.description}</p>
        <p className="truncate text-xs text-muted-foreground">
          {category.label}
          {showDate && ` · ${formatShortDate(transaction.date)}`}
        </p>
      </div>
      <Amount
        cents={isIncome ? transaction.amountCents : -transaction.amountCents}
        signed
        tone={isIncome ? "income" : "neutral"}
        className="text-sm font-semibold"
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Ações para ${transaction.description}`}
            className="text-muted-foreground"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-36 rounded-xl">
          <DropdownMenuItem onSelect={() => openEdit(transaction)} className="gap-2 rounded-lg">
            <Pencil className="h-4 w-4" aria-hidden />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => openDelete(transaction)}
            className="gap-2 rounded-lg text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

interface TransactionListProps {
  transactions: readonly Transaction[];
  today: Date;
  groupByDay?: boolean;
}

export function TransactionList({ transactions, today, groupByDay = false }: TransactionListProps) {
  const groups = useMemo(() => {
    const byDate = new Map<string, Transaction[]>();
    for (const transaction of transactions) {
      const group = byDate.get(transaction.date);
      if (group) group.push(transaction);
      else byDate.set(transaction.date, [transaction]);
    }
    return [...byDate.entries()];
  }, [transactions]);

  if (!groupByDay) {
    return (
      <ul className="-mx-2 flex flex-col">
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} showDate />
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map(([date, items]) => (
        <section key={date} aria-label={formatDayHeading(date, today)}>
          <h3 className="mb-1 px-0 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {formatDayHeading(date, today)}
          </h3>
          <ul className="-mx-2 flex flex-col">
            {items.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} showDate={false} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
