import { addDays, addMonths, format, startOfMonth, subMonths } from "date-fns";

import type { CategoryId } from "./categories";
import { countRangeDays, isWithinRange, parseISODate, toISODate, type DateRange } from "./dates";
import type { Totals, Transaction, TransactionType } from "./types";

export type SeriesGranularity = "day" | "month";

export interface CashflowPoint extends Totals {
  key: string;
}

export interface CashflowSeries {
  granularity: SeriesGranularity;
  points: CashflowPoint[];
}

export interface MonthSummary extends Totals {
  month: string;
}

export interface CategoryShare {
  categoryId: CategoryId;
  totalCents: number;
  share: number;
}

export interface FinancialIndicators {
  savingsRate: number | null;
  expenseRatio: number | null;
  averageDailyExpenseCents: number;
  largestExpense: Transaction | null;
  topExpenseCategory: CategoryShare | null;
  transactionCount: number;
}

const DAILY_GRANULARITY_MAX_DAYS = 62;

const emptyTotals = (): Totals => ({ incomeCents: 0, expenseCents: 0, netCents: 0 });

function addToTotals(totals: Totals, transaction: Transaction): void {
  if (transaction.type === "income") {
    totals.incomeCents += transaction.amountCents;
  } else {
    totals.expenseCents += transaction.amountCents;
  }
  totals.netCents = totals.incomeCents - totals.expenseCents;
}

export function calculateTotals(transactions: readonly Transaction[]): Totals {
  const totals = emptyTotals();
  for (const transaction of transactions) addToTotals(totals, transaction);
  return totals;
}

export function calculateAvailableBalance(
  transactions: readonly Transaction[],
  todayISO: string,
): number {
  return calculateTotals(transactions.filter((t) => t.date <= todayISO)).netCents;
}

export function filterByRange(
  transactions: readonly Transaction[],
  range: DateRange | null,
): Transaction[] {
  return transactions.filter((t) => isWithinRange(t.date, range));
}

export function safeRatio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

export function compareByMostRecent(a: Transaction, b: Transaction): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
  return 0;
}

export function getDataExtent(transactions: readonly Transaction[]): DateRange | null {
  if (transactions.length === 0) return null;
  let from = transactions[0]?.date ?? "";
  let to = from;
  for (const { date } of transactions) {
    if (date < from) from = date;
    if (date > to) to = date;
  }
  return { from, to };
}

function enumerateBucketKeys(range: DateRange, granularity: SeriesGranularity): string[] {
  const keys: string[] = [];
  const end = parseISODate(range.to);
  if (granularity === "day") {
    for (let cursor = parseISODate(range.from); cursor <= end; cursor = addDays(cursor, 1)) {
      keys.push(toISODate(cursor));
    }
    return keys;
  }
  for (
    let cursor = startOfMonth(parseISODate(range.from));
    cursor <= end;
    cursor = addMonths(cursor, 1)
  ) {
    keys.push(format(cursor, "yyyy-MM"));
  }
  return keys;
}

export function buildCashflowSeries(
  transactions: readonly Transaction[],
  range: DateRange,
): CashflowSeries {
  const granularity: SeriesGranularity =
    countRangeDays(range) <= DAILY_GRANULARITY_MAX_DAYS ? "day" : "month";
  const buckets = new Map<string, CashflowPoint>(
    enumerateBucketKeys(range, granularity).map((key) => [key, { key, ...emptyTotals() }]),
  );
  for (const transaction of transactions) {
    if (!isWithinRange(transaction.date, range)) continue;
    const key = granularity === "day" ? transaction.date : transaction.date.slice(0, 7);
    const bucket = buckets.get(key);
    if (bucket) addToTotals(bucket, transaction);
  }
  return { granularity, points: [...buckets.values()] };
}

export function buildMonthlySummaries(
  transactions: readonly Transaction[],
  referenceDate: Date,
  count: number,
): MonthSummary[] {
  const summaries = new Map<string, MonthSummary>();
  for (let offset = count - 1; offset >= 0; offset--) {
    const month = format(subMonths(startOfMonth(referenceDate), offset), "yyyy-MM");
    summaries.set(month, { month, ...emptyTotals() });
  }
  for (const transaction of transactions) {
    const summary = summaries.get(transaction.date.slice(0, 7));
    if (summary) addToTotals(summary, transaction);
  }
  return [...summaries.values()];
}

export function groupByCategory(
  transactions: readonly Transaction[],
  type: TransactionType,
): CategoryShare[] {
  const totals = new Map<CategoryId, number>();
  let grandTotal = 0;
  for (const transaction of transactions) {
    if (transaction.type !== type) continue;
    totals.set(
      transaction.categoryId,
      (totals.get(transaction.categoryId) ?? 0) + transaction.amountCents,
    );
    grandTotal += transaction.amountCents;
  }
  return [...totals.entries()]
    .map(([categoryId, totalCents]) => ({
      categoryId,
      totalCents,
      share: grandTotal > 0 ? totalCents / grandTotal : 0,
    }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

function countElapsedDays(range: DateRange, todayISO: string): number {
  if (todayISO < range.from) return countRangeDays(range);
  const to = todayISO < range.to ? todayISO : range.to;
  return countRangeDays({ from: range.from, to });
}

export function calculateIndicators(
  transactions: readonly Transaction[],
  range: DateRange | null,
  today: Date,
): FinancialIndicators {
  const totals = calculateTotals(transactions);
  const effectiveRange = range ?? getDataExtent(transactions);
  const days = effectiveRange ? countElapsedDays(effectiveRange, toISODate(today)) : 0;
  const largestExpense = transactions.reduce<Transaction | null>(
    (largest, t) =>
      t.type === "expense" && (!largest || t.amountCents > largest.amountCents) ? t : largest,
    null,
  );

  return {
    savingsRate: safeRatio(totals.netCents, totals.incomeCents),
    expenseRatio: safeRatio(totals.expenseCents, totals.incomeCents),
    averageDailyExpenseCents: days > 0 ? Math.round(totals.expenseCents / days) : 0,
    largestExpense,
    topExpenseCategory: groupByCategory(transactions, "expense")[0] ?? null,
    transactionCount: transactions.length,
  };
}
