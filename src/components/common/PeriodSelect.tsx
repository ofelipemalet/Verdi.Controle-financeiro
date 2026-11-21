import { CalendarDays } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_OPTIONS, isPeriodKey, type PeriodKey } from "@/features/finance/model/dates";
import { cn } from "@/lib/utils";

interface PeriodSelectProps {
  value: PeriodKey;
  onChange: (value: PeriodKey) => void;
  className?: string;
}

export function PeriodSelect({ value, onChange, className }: PeriodSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isPeriodKey(next)) onChange(next);
      }}
    >
      <SelectTrigger
        aria-label="Período"
        className={cn(
          "press h-10 w-auto min-w-44 gap-2 rounded-full border-border bg-card px-4 font-semibold shadow-card hover:border-primary/30",
          className,
        )}
      >
        <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="rounded-2xl">
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="rounded-xl">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
