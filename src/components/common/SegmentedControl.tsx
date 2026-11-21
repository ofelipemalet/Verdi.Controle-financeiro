import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const itemVariants = cva(
  "press inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-card data-[state=on]:shadow-card",
  {
    variants: {
      tone: {
        neutral: "data-[state=on]:text-foreground",
        income: "data-[state=on]:text-income",
        expense: "data-[state=on]:text-expense",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  tone?: "neutral" | "income" | "expense";
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  ariaLabel: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        const option = options.find((o) => o.value === next);
        if (option) onChange(option.value);
      }}
      aria-label={ariaLabel}
      className={cn("inline-flex rounded-full bg-muted p-1", className)}
    >
      {options.map(({ value: optionValue, label, icon: Icon, tone }) => (
        <ToggleGroupPrimitive.Item
          key={optionValue}
          value={optionValue}
          className={itemVariants({ tone })}
        >
          {Icon && <Icon className="h-4 w-4" aria-hidden />}
          {label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}
