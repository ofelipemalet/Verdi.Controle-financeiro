import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Amount } from "./Amount";

const iconVariants = cva("inline-flex h-10 w-10 items-center justify-center rounded-2xl", {
  variants: {
    tone: {
      income: "bg-income-soft text-income",
      expense: "bg-expense-soft text-expense",
      savings: "bg-savings-soft text-savings",
    },
  },
});

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
    <article className={cn("surface-card animate-rise flex flex-col gap-4 p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={iconVariants({ tone })} aria-hidden>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div>
        <Amount
          cents={cents}
          tone={tone === "savings" ? "auto" : "neutral"}
          className="font-display text-2xl font-semibold tracking-tight"
        />
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </article>
  );
}
