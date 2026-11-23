import { describe, expect, it } from "vitest";

import {
  buildCashflowSeries,
  buildMonthlySummaries,
  calculateAvailableBalance,
  calculateIndicators,
  calculateTotals,
  filterByRange,
  groupByCategory,
  percentChange,
  resolveChartRange,
} from "./calculations";
import type { CategoryId } from "./categories";
import { resolvePeriod } from "./dates";
import type { Transaction, TransactionType } from "./types";

let sequence = 0;
function tx(
  type: TransactionType,
  amountCents: number,
  date: string,
  categoryId: CategoryId = type === "income" ? "salary" : "food",
): Transaction {
  sequence += 1;
  return {
    id: `t${sequence}`,
    type,
    description: "Teste",
    amountCents,
    categoryId,
    date,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

const today = new Date(2026, 10, 21);

describe("totals", () => {
  it("sums income, expenses and net without floating point drift", () => {
    const totals = calculateTotals([
      tx("income", 10, "2026-11-01"),
      tx("income", 20, "2026-11-01"),
      tx("expense", 15, "2026-11-01"),
    ]);
    expect(totals).toEqual({ incomeCents: 30, expenseCents: 15, netCents: 15 });
  });

  it("excludes future-dated movements from the available balance", () => {
    const balance = calculateAvailableBalance(
      [tx("income", 500000, "2026-11-05"), tx("expense", 120000, "2026-11-30")],
      "2026-11-21",
    );
    expect(balance).toBe(500000);
  });
});

describe("periods", () => {
  it("filters by the current month", () => {
    const range = resolvePeriod("this-month", today);
    expect(range).toEqual({ from: "2026-11-01", to: "2026-11-30" });
    const items = [tx("income", 1, "2026-10-31"), tx("income", 1, "2026-11-01")];
    expect(filterByRange(items, range)).toHaveLength(1);
  });

  it("covers three full months for last-3-months", () => {
    expect(resolvePeriod("last-3-months", today)).toEqual({ from: "2026-09-01", to: "2026-11-30" });
  });

  it("returns no bounds for the whole period", () => {
    expect(resolvePeriod("all", today)).toBeNull();
  });
});

describe("series", () => {
  it("uses daily buckets for a month", () => {
    const series = buildCashflowSeries([tx("expense", 300, "2026-11-10")], {
      from: "2026-11-01",
      to: "2026-11-30",
    });
    expect(series.granularity).toBe("day");
    expect(series.points).toHaveLength(30);
    expect(series.points.find((p) => p.key === "2026-11-10")?.expenseCents).toBe(300);
  });

  it("uses monthly buckets for longer ranges", () => {
    const series = buildCashflowSeries([tx("income", 100, "2026-03-15")], {
      from: "2026-01-01",
      to: "2026-12-31",
    });
    expect(series.granularity).toBe("month");
    expect(series.points).toHaveLength(12);
    expect(series.points.find((p) => p.key === "2026-03")?.incomeCents).toBe(100);
  });

  it("summarises the last months in chronological order", () => {
    const months = buildMonthlySummaries(
      [tx("income", 1000, "2026-10-02"), tx("expense", 400, "2026-11-03")],
      today,
      2,
    );
    expect(months.map((m) => m.month)).toEqual(["2026-10", "2026-11"]);
    expect(months[0]?.netCents).toBe(1000);
    expect(months[1]?.netCents).toBe(-400);
  });
});

describe("categories and indicators", () => {
  it("groups expenses by category with shares that add up to 100%", () => {
    const shares = groupByCategory(
      [
        tx("expense", 300, "2026-11-01", "food"),
        tx("expense", 100, "2026-11-02", "transport"),
        tx("income", 999, "2026-11-02"),
      ],
      "expense",
    );
    expect(shares.map((s) => s.categoryId)).toEqual(["food", "transport"]);
    expect(shares[0]?.share).toBe(0.75);
    expect(shares.reduce((sum, s) => sum + s.share, 0)).toBe(1);
  });

  it("computes savings rate and daily average over elapsed days", () => {
    const range = resolvePeriod("this-month", today);
    const items = [tx("income", 10000, "2026-11-01"), tx("expense", 4200, "2026-11-10")];
    const indicators = calculateIndicators(items, range, today);
    expect(indicators.savingsRate).toBeCloseTo(0.58);
    expect(indicators.expenseRatio).toBeCloseTo(0.42);
    expect(indicators.averageDailyExpenseCents).toBe(200);
    expect(indicators.largestExpense?.amountCents).toBe(4200);
  });

  it("has no savings rate without income", () => {
    const indicators = calculateIndicators([tx("expense", 100, "2026-11-01")], null, today);
    expect(indicators.savingsRate).toBeNull();
  });

  it("returns no percent change when the previous value is zero", () => {
    expect(percentChange(100, 0)).toBeNull();
    expect(percentChange(150, 100)).toBe(0.5);
    expect(percentChange(-50, -100)).toBe(0.5);
  });

  it("extends the whole-period chart range up to today", () => {
    expect(resolveChartRange(null, [tx("expense", 1, "2026-10-10")], "2026-11-21")).toEqual({
      from: "2026-10-10",
      to: "2026-11-21",
    });
    expect(resolveChartRange(null, [], "2026-11-21")).toBeNull();
  });
});
