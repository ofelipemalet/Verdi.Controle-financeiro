import { z } from "zod";

import { compareByMostRecent } from "../model/calculations";
import { createTransactionInputSchema, storedTransactionSchema } from "../model/schema";
import type { Transaction, TransactionInput } from "../model/types";
import { RepositoryError, type TransactionRepository } from "./transaction-repository";

export const TRANSACTIONS_STORAGE_KEY = "finance:transactions";

const STORAGE_VERSION = 1;

const storageEnvelopeSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  transactions: z.array(z.unknown()),
});

interface LocalStorageRepositoryOptions {
  getStorage: () => Storage | null;
  now?: () => Date;
  generateId?: () => string;
}

export function createLocalStorageTransactionRepository({
  getStorage,
  now = () => new Date(),
  generateId = () => crypto.randomUUID(),
}: LocalStorageRepositoryOptions): TransactionRepository {
  function requireStorage(): Storage {
    const storage = getStorage();
    if (!storage) {
      throw new RepositoryError("O armazenamento do navegador não está disponível.");
    }
    return storage;
  }

  function read(): Transaction[] {
    const raw = requireStorage().getItem(TRANSACTIONS_STORAGE_KEY);
    if (raw === null) return [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new RepositoryError("Não foi possível ler as movimentações salvas.", { cause: error });
    }

    const envelope = storageEnvelopeSchema.safeParse(parsed);
    if (!envelope.success) {
      throw new RepositoryError("As movimentações salvas estão em um formato inválido.");
    }

    return envelope.data.transactions
      .flatMap((item): Transaction[] => {
        const result = storedTransactionSchema.safeParse(item);
        return result.success ? [result.data] : [];
      })
      .sort(compareByMostRecent);
  }

  function write(transactions: Transaction[]): void {
    try {
      requireStorage().setItem(
        TRANSACTIONS_STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, transactions }),
      );
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError(
        "Não foi possível salvar. O armazenamento do navegador pode estar cheio.",
        { cause: error },
      );
    }
  }

  function validateInput(input: TransactionInput): TransactionInput {
    const result = createTransactionInputSchema(now()).safeParse(input);
    if (!result.success) {
      throw new RepositoryError(result.error.issues[0]?.message ?? "Dados inválidos.");
    }
    return result.data;
  }

  return {
    async list() {
      return read();
    },

    async create(input) {
      const data = validateInput(input);
      const timestamp = now().toISOString();
      const transaction: Transaction = {
        ...data,
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      write([transaction, ...read()]);
      return transaction;
    },

    async update(id, input) {
      const data = validateInput(input);
      const transactions = read();
      const existing = transactions.find((t) => t.id === id);
      if (!existing) throw new RepositoryError("Movimentação não encontrada.");
      const updated: Transaction = { ...existing, ...data, updatedAt: now().toISOString() };
      write(transactions.map((t) => (t.id === id ? updated : t)));
      return updated;
    },

    async remove(id) {
      const transactions = read();
      if (!transactions.some((t) => t.id === id)) {
        throw new RepositoryError("Movimentação não encontrada.");
      }
      write(transactions.filter((t) => t.id !== id));
    },

    subscribe(onChange) {
      if (typeof window === "undefined") return () => undefined;
      const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === TRANSACTIONS_STORAGE_KEY) onChange();
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    },
  };
}
