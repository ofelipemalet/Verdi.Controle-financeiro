import { beforeEach, describe, expect, it } from "vitest";

import {
  TRANSACTIONS_STORAGE_KEY,
  createLocalStorageTransactionRepository,
} from "./local-storage-repository";
import { RepositoryError } from "./transaction-repository";

const input = {
  type: "income",
  description: "Salário",
  amountCents: 500000,
  categoryId: "salary",
  date: "2026-11-05",
} as const;

function makeRepository() {
  let id = 0;
  return createLocalStorageTransactionRepository({
    getStorage: () => window.localStorage,
    now: () => new Date(2026, 10, 21, 12),
    generateId: () => `id-${++id}`,
  });
}

describe("local storage repository", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists created transactions across repository instances", async () => {
    await makeRepository().create(input);
    const list = await makeRepository().list();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject(input);
  });

  it("updates and removes transactions", async () => {
    const repository = makeRepository();
    const created = await repository.create(input);
    await repository.update(created.id, { ...input, amountCents: 1000 });
    expect((await repository.list())[0]?.amountCents).toBe(1000);
    await repository.remove(created.id);
    expect(await repository.list()).toEqual([]);
  });

  it("refuses invalid input", async () => {
    await expect(makeRepository().create({ ...input, amountCents: 0 })).rejects.toBeInstanceOf(
      RepositoryError,
    );
    expect(window.localStorage.getItem(TRANSACTIONS_STORAGE_KEY)).toBeNull();
  });

  it("drops tampered entries and reports corrupted storage", async () => {
    window.localStorage.setItem(
      TRANSACTIONS_STORAGE_KEY,
      JSON.stringify({ version: 1, transactions: [{ id: "x", amountCents: -5 }] }),
    );
    expect(await makeRepository().list()).toEqual([]);

    window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, "{not json");
    await expect(makeRepository().list()).rejects.toBeInstanceOf(RepositoryError);
  });

  it("fails clearly when storage is unavailable", async () => {
    const repository = createLocalStorageTransactionRepository({ getStorage: () => null });
    await expect(repository.list()).rejects.toBeInstanceOf(RepositoryError);
  });
});
