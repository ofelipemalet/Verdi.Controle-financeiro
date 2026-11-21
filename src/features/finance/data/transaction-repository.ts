import type { Transaction, TransactionInput } from "../model/types";

export interface TransactionRepository {
  list(): Promise<Transaction[]>;
  create(input: TransactionInput): Promise<Transaction>;
  update(id: string, input: TransactionInput): Promise<Transaction>;
  remove(id: string): Promise<void>;
  subscribe(onChange: () => void): () => void;
}

export class RepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "RepositoryError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof RepositoryError) return error.message;
  return "Algo deu errado. Tente novamente.";
}
