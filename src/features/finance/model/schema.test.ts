import { describe, expect, it } from "vitest";

import { MAX_AMOUNT_CENTS } from "./money";
import { createTransactionInputSchema, sanitizeText } from "./schema";

const schema = createTransactionInputSchema(new Date(2026, 10, 21));
const valid = {
  type: "expense",
  description: "Mercado",
  amountCents: 12990,
  categoryId: "food",
  date: "2026-11-20",
} as const;

function firstError(input: Record<string, unknown>) {
  const result = schema.safeParse(input);
  return result.success ? null : result.error.issues[0];
}

describe("transaction input validation", () => {
  it("accepts a valid expense", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("rejects zero, negative, fractional and oversized amounts", () => {
    expect(firstError({ ...valid, amountCents: 0 })?.path).toEqual(["amountCents"]);
    expect(firstError({ ...valid, amountCents: -100 })?.path).toEqual(["amountCents"]);
    expect(firstError({ ...valid, amountCents: 10.5 })?.path).toEqual(["amountCents"]);
    expect(firstError({ ...valid, amountCents: MAX_AMOUNT_CENTS + 1 })?.path).toEqual([
      "amountCents",
    ]);
    expect(firstError({ ...valid, amountCents: Number.NaN })?.path).toEqual(["amountCents"]);
  });

  it("requires a description of at least 2 characters after trimming", () => {
    expect(firstError({ ...valid, description: "   a  " })?.path).toEqual(["description"]);
  });

  it("rejects angle brackets in the description", () => {
    expect(firstError({ ...valid, description: "<script>x</script>" })?.path).toEqual([
      "description",
    ]);
  });

  it("rejects a category from the other type", () => {
    expect(firstError({ ...valid, categoryId: "salary" })?.path).toEqual(["categoryId"]);
  });

  it("rejects impossible or out-of-range dates", () => {
    expect(firstError({ ...valid, date: "2026-02-30" })?.path).toEqual(["date"]);
    expect(firstError({ ...valid, date: "1999-12-31" })?.path).toEqual(["date"]);
    expect(firstError({ ...valid, date: "2027-11-22" })?.path).toEqual(["date"]);
  });
});

describe("sanitizeText", () => {
  it("removes invisible characters and collapses whitespace", () => {
    expect(sanitizeText("  Conta\u200B de\n\tluz  ")).toBe("Conta de luz");
  });
});
