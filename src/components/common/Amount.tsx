import { cva, type VariantProps } from "class-variance-authority";

import { formatCurrency, formatSignedCurrency } from "@/features/finance/model/money";
import { cn } from "@/lib/utils";

const amountVariants = cva("tabular whitespace-nowrap", {
  variants: {
    tone: {
      neutral: "",
      income: "text-income",
      expense: "text-expense",
      savings: "text-savings",
      auto: "",
    },
  },
  defaultVariants: { tone: "neutral" },
});

interface AmountProps extends VariantProps<typeof amountVariants> {
  cents: number;
  signed?: boolean;
  className?: string;
}

export function Amount({ cents, signed = false, tone, className }: AmountProps) {
  const resolvedTone = tone === "auto" ? (cents < 0 ? "expense" : "neutral") : tone;
  return (
    <span className={cn(amountVariants({ tone: resolvedTone }), className)}>
      {signed ? formatSignedCurrency(cents) : formatCurrency(cents)}
    </span>
  );
}
