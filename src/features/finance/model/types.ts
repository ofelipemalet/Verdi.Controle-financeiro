import type { CategoryId } from "./categories";

export const TRANSACTION_TYPES = ["income", "expense"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amountCents: number;
  categoryId: CategoryId;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Pick<
  Transaction,
  "type" | "description" | "amountCents" | "categoryId" | "date"
>;

export interface Totals {
  incomeCents: number;
  expenseCents: number;
  netCents: number;
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Receita",
  expense: "Despesa",
};
