import type { Transaction, TransactionInput } from "../model/types";
import { RepositoryError, type TransactionRepository } from "./transaction-repository";
import {
  createTransactionFn,
  deleteTransactionFn,
  listTransactionsFn,
  updateTransactionFn,
} from "./transactions.functions";

const SAFE_USER_MESSAGES = new Set([
  "Não foi possível carregar suas movimentações.",
  "Não foi possível salvar a movimentação.",
  "Não foi possível atualizar a movimentação.",
  "Não foi possível excluir a movimentação.",
  "Movimentação não encontrada.",
]);

function toRepositoryError(error: unknown, fallback: string): RepositoryError {
  if (error instanceof RepositoryError) return error;
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return new RepositoryError("Você está sem conexão. Tente novamente quando voltar à internet.", {
      cause: error,
    });
  }
  if (error instanceof Error) {
    if (error.message.includes("Unauthorized")) {
      return new RepositoryError("Sua sessão expirou. Entre novamente na sua conta.", {
        cause: error,
      });
    }
    if (SAFE_USER_MESSAGES.has(error.message)) {
      return new RepositoryError(error.message, { cause: error });
    }
  }
  return new RepositoryError(fallback, { cause: error });
}

export function createCloudTransactionRepository(): TransactionRepository {
  return {
    async list(): Promise<Transaction[]> {
      try {
        return await listTransactionsFn();
      } catch (error) {
        throw toRepositoryError(error, "Não foi possível carregar suas movimentações.");
      }
    },

    async create(input: TransactionInput): Promise<Transaction> {
      try {
        return await createTransactionFn({ data: input });
      } catch (error) {
        throw toRepositoryError(error, "Não foi possível salvar a movimentação.");
      }
    },

    async update(id: string, input: TransactionInput): Promise<Transaction> {
      try {
        return await updateTransactionFn({ data: { id, input } });
      } catch (error) {
        throw toRepositoryError(error, "Não foi possível atualizar a movimentação.");
      }
    },

    async remove(id: string): Promise<void> {
      try {
        await deleteTransactionFn({ data: { id } });
      } catch (error) {
        throw toRepositoryError(error, "Não foi possível excluir a movimentação.");
      }
    },

    subscribe(): () => void {
      return () => undefined;
    },
  };
}