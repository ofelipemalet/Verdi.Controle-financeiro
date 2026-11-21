import {
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  endOfYear,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const MIN_TRANSACTION_DATE = "2000-01-01";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface DateRange {
  from: string;
  to: string;
}

export const PERIOD_OPTIONS = [
  { value: "this-month", label: "Este mês" },
  { value: "last-month", label: "Mês passado" },
  { value: "last-3-months", label: "Últimos 3 meses" },
  { value: "last-6-months", label: "Últimos 6 meses" },
  { value: "this-year", label: "Este ano" },
  { value: "all", label: "Todo o período" },
] as const;

export type PeriodKey = (typeof PERIOD_OPTIONS)[number]["value"];

export const DEFAULT_PERIOD: PeriodKey = "this-month";

export function isPeriodKey(value: string): value is PeriodKey {
  return PERIOD_OPTIONS.some((option) => option.value === value);
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseISODate(value: string): Date {
  return parse(value, "yyyy-MM-dd", new Date(0));
}

export function isValidISODate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = parseISODate(value);
  return isValid(date) && toISODate(date) === value;
}

export function getMaxTransactionDate(today: Date): string {
  return toISODate(addYears(today, 1));
}

export function resolvePeriod(period: PeriodKey, today: Date): DateRange | null {
  const range = (from: Date, to: Date): DateRange => ({ from: toISODate(from), to: toISODate(to) });
  switch (period) {
    case "this-month":
      return range(startOfMonth(today), endOfMonth(today));
    case "last-month": {
      const previous = subMonths(today, 1);
      return range(startOfMonth(previous), endOfMonth(previous));
    }
    case "last-3-months":
      return range(startOfMonth(subMonths(today, 2)), endOfMonth(today));
    case "last-6-months":
      return range(startOfMonth(subMonths(today, 5)), endOfMonth(today));
    case "this-year":
      return range(startOfYear(today), endOfYear(today));
    case "all":
      return null;
  }
}

export function isWithinRange(date: string, range: DateRange | null): boolean {
  if (!range) return true;
  return date >= range.from && date <= range.to;
}

export function countRangeDays(range: DateRange): number {
  return differenceInCalendarDays(parseISODate(range.to), parseISODate(range.from)) + 1;
}

export function formatLongDate(value: string): string {
  return format(parseISODate(value), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatShortDate(value: string): string {
  return format(parseISODate(value), "dd/MM/yyyy");
}

export function formatDayHeading(value: string, today: Date): string {
  const diff = differenceInCalendarDays(today, parseISODate(value));
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return format(parseISODate(value), "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatMonthKey(monthKey: string, pattern = "MMM yyyy"): string {
  return format(parse(monthKey, "yyyy-MM", new Date(0)), pattern, { locale: ptBR });
}

export function formatRangeLabel(range: DateRange): string {
  return `${formatShortDate(range.from)} – ${formatShortDate(range.to)}`;
}
