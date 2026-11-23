import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Amount } from "./Amount";

const iconVariants = cva(
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl sm:h-10 sm:w-10",
  {
    variants: {
      tone: {
        income: "bg-income-soft text-income",
        expense: "bg-expense-soft text-expense",
        savings: "bg-savings-soft text-savings",
      },
    },
  },
);

interface StatCardProps {
  label: string;
  cents: number;
  icon: LucideIcon;
  tone: "income" | "expense" | "savings";
  hint?: ReactNode;
  className?: string;
}

export function StatCard({ label, cents, icon: Icon, tone, hint, className }: StatCardProps) {
  return (
    <article
      className={cn(
        "surface-card animate-rise flex min-w-0 flex-col gap-3 p-4 sm:gap-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
        <span className={iconVariants({ tone })} aria-hidden>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="min-w-0">
        <Amount
          cents={cents}
          tone={tone === "savings" ? "auto" : "neutral"}
          className="block truncate font-display text-xl font-semibold tracking-tight sm:text-2xl"
        />
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </article>
  );
}
