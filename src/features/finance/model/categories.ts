import type { TransactionType } from "./types";

export const INCOME_CATEGORY_IDS = [
  "salary",
  "freelance",
  "investments",
  "gifts",
  "refunds",
  "other-income",
] as const;

export const EXPENSE_CATEGORY_IDS = [
  "housing",
  "food",
  "transport",
  "health",
  "education",
  "leisure",
  "shopping",
  "bills",
  "subscriptions",
  "other-expense",
] as const;

export type IncomeCategoryId = (typeof INCOME_CATEGORY_IDS)[number];
export type ExpenseCategoryId = (typeof EXPENSE_CATEGORY_IDS)[number];
export type CategoryId = IncomeCategoryId | ExpenseCategoryId;

export interface Category {
  id: CategoryId;
  type: TransactionType;
  label: string;
}

const CATEGORY_LABELS: Record<CategoryId, string> = {
  salary: "Salário",
  freelance: "Trabalho extra",
  investments: "Rendimentos",
  gifts: "Presentes",
  refunds: "Reembolsos",
  "other-income": "Outras receitas",
  housing: "Moradia",
  food: "Alimentação",
  transport: "Transporte",
  health: "Saúde",
  education: "Educação",
  leisure: "Lazer",
  shopping: "Compras",
  bills: "Contas",
  subscriptions: "Assinaturas",
  "other-expense": "Outras despesas",
};

const ALL_CATEGORY_IDS: readonly CategoryId[] = [...INCOME_CATEGORY_IDS, ...EXPENSE_CATEGORY_IDS];

const CATEGORY_IDS_BY_TYPE: Record<TransactionType, readonly CategoryId[]> = {
  income: INCOME_CATEGORY_IDS,
  expense: EXPENSE_CATEGORY_IDS,
};

export function isCategoryId(value: string): value is CategoryId {
  return (ALL_CATEGORY_IDS as readonly string[]).includes(value);
}

export function isCategoryOfType(id: string, type: TransactionType): boolean {
  return (CATEGORY_IDS_BY_TYPE[type] as readonly string[]).includes(id);
}

export function getCategory(id: CategoryId): Category {
  return {
    id,
    type: isCategoryOfType(id, "income") ? "income" : "expense",
    label: CATEGORY_LABELS[id],
  };
}

export function getCategoriesByType(type: TransactionType): Category[] {
  return CATEGORY_IDS_BY_TYPE[type].map(getCategory);
}
