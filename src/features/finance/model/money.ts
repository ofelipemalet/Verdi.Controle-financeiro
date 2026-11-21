export const MAX_AMOUNT_CENTS = 99_999_999_999;

const MAX_AMOUNT_DIGITS = String(MAX_AMOUNT_CENTS).length;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function formatSignedCurrency(cents: number): string {
  if (cents === 0) return formatCurrency(0);
  return `${cents > 0 ? "+" : "−"} ${formatCurrency(Math.abs(cents))}`;
}

export function formatCompactCurrency(cents: number): string {
  return compactCurrencyFormatter.format(cents / 100);
}

export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio);
}

export function parseCurrencyDigits(raw: string): number | null {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 0) return 0;
  if (digits.length > MAX_AMOUNT_DIGITS) return null;
  const cents = Number(digits);
  if (!Number.isSafeInteger(cents) || cents > MAX_AMOUNT_CENTS) return null;
  return cents;
}

export function isValidAmountCents(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= MAX_AMOUNT_CENTS
  );
}
