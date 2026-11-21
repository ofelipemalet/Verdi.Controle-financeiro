import { createLocalStorageTransactionRepository } from "./local-storage-repository";
import type { TransactionRepository } from "./transaction-repository";

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export const transactionRepository: TransactionRepository = createLocalStorageTransactionRepository(
  { getStorage: getBrowserStorage },
);

export { RepositoryError, getErrorMessage } from "./transaction-repository";
export type { TransactionRepository } from "./transaction-repository";
