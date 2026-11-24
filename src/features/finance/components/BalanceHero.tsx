import { GuillochePattern } from "@/components/common/GuillochePattern";
import { BrandMark } from "@/components/layout/BrandMark";
import { cn } from "@/lib/utils";

import { formatCurrency, formatCurrencyParts } from "../model/money";

interface BalanceHeroProps {
  balanceCents: number;
  className?: string;
}

export function BalanceHero({ balanceCents, className }: BalanceHeroProps) {
  const { sign, symbol, value } = formatCurrencyParts(balanceCents);

  return (
    <section
      aria-label="Saldo disponível"
      className={cn(
        "surface-hero animate-rise relative flex flex-col overflow-hidden p-5 sm:p-6 md:p-7",
        className,
      )}
    >
      <GuillochePattern className="absolute inset-y-0 right-0 h-full w-[90%] text-hero-foreground/[0.08] md:w-3/4" />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-hero-accent/10 blur-3xl"
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BrandMark className="h-7 w-7 shadow-none ring-1 ring-hero-foreground/20" />
          <span className="font-display text-sm font-semibold tracking-tight">Verdi</span>
        </div>
        <span className="rounded-full border border-hero-foreground/15 bg-hero-foreground/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-hero-muted">
          Conta pessoal
        </span>
      </div>

      <div className="relative mt-8 md:mt-10">
        <p className="text-sm font-medium text-hero-muted">Saldo disponível</p>
        <p
          className="tabular mt-1.5 flex items-baseline gap-1.5 font-display font-semibold tracking-tight"
          aria-label={formatCurrency(balanceCents)}
        >
          <span className="text-lg text-hero-muted md:text-xl">
            {sign}
            {symbol}
          </span>
          <span className="min-w-0 truncate text-4xl md:text-5xl">{value}</span>
        </p>
      </div>

      <div className="relative mt-6 flex items-center gap-2 border-t border-hero-foreground/10 pt-4 text-xs text-hero-muted md:mt-auto">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-hero-accent" aria-hidden />
        Considera todas as movimentações até hoje
      </div>
    </section>
  );
}
