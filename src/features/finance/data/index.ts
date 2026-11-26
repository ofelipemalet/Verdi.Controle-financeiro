import { createCloudTransactionRepository } from "./cloud-repository";
import type { TransactionRepository } from "./transaction-repository";

export const transactionRepository: TransactionRepository = createCloudTransactionRepository();

export { RepositoryError, getErrorMessage } from "./transaction-repository";
export type { TransactionRepository } from "./transaction-repository";
