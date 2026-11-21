import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import { formatCurrency, parseCurrencyDigits } from "../model/money";

interface CurrencyInputProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "onChange" | "type" | "inputMode"
> {
  value: number;
  onValueChange: (cents: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, className, ...props }, ref) => (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={formatCurrency(0)}
      value={value > 0 ? formatCurrency(value) : ""}
      onChange={(event) => {
        const cents = parseCurrencyDigits(event.target.value);
        if (cents !== null) onValueChange(cents);
      }}
      className={cn(
        "tabular w-full bg-transparent font-display text-4xl font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50",
        className,
      )}
      {...props}
    />
  ),
);
CurrencyInput.displayName = "CurrencyInput";
