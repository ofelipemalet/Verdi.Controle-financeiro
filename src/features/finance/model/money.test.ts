import { describe, expect, it } from "vitest";

import { MAX_AMOUNT_CENTS, formatCurrency, parseCurrencyDigits } from "./money";

describe("parseCurrencyDigits", () => {
  it("reads typed digits as cents", () => {
    expect(parseCurrencyDigits("R$ 1.234,56")).toBe(123456);
    expect(parseCurrencyDigits("5")).toBe(5);
  });

  it("treats empty input as zero", () => {
    expect(parseCurrencyDigits("")).toBe(0);
    expect(parseCurrencyDigits("R$ ")).toBe(0);
  });

  it("rejects values above the maximum", () => {
    expect(parseCurrencyDigits(String(MAX_AMOUNT_CENTS))).toBe(MAX_AMOUNT_CENTS);
    expect(parseCurrencyDigits(`${MAX_AMOUNT_CENTS}0`)).toBeNull();
  });
});

describe("formatCurrency", () => {
  it("formats cents as Brazilian reais", () => {
    expect(formatCurrency(123456).replace(/\s/g, " ")).toBe("R$ 1.234,56");
  });
});
