import type { User } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { AuthenticatedUserProvider } from "@/features/auth/auth-context";

import type { TransactionRepository } from "../data";
import type { Transaction, TransactionInput } from "../model/types";
import { useTransactionMutations, useTransactions } from "./use-transactions";

function createMemoryRepository(initial: Transaction[]): TransactionRepository {
  let items = [...initial];
  return {
    async list() {
      return [...items];
    },
    async create(input: TransactionInput) {
      const now = "2026-11-26T12:00:00.000Z";
      const created: Transaction = { id: `tx-${items.length + 1}`, ...input, createdAt: now, updatedAt: now };
      items = [created, ...items];
      return created;
    },
    async update(id: string, input: TransactionInput) {
      const existing = items.find((t) => t.id === id);
      if (!existing) throw new Error("Not found");
      const updated: Transaction = { ...existing, ...input, updatedAt: "2026-11-26T13:00:00.000Z" };
      items = items.map((t) => (t.id === id ? updated : t));
      return updated;
    },
    async remove(id: string) {
      items = items.filter((t) => t.id !== id);
    },
    subscribe() {
      return () => undefined;
    },
  };
}

function makeUser(id: string): User {
  return { id, app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "2026-11-26T00:00:00Z" };
}

function createWrapper(queryClient: QueryClient, user: User) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthenticatedUserProvider user={user}>{children}</AuthenticatedUserProvider>
      </QueryClientProvider>
    );
  };
}

describe("useTransactions account isolation", () => {
  it("scopes cached queries per authenticated user and updates after mutations", async () => {
    const sharedClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const repoA = createMemoryRepository([
      {
        id: "tx-a-1",
        type: "income",
        description: "Salário A",
        amountCents: 500000,
        categoryId: "salary",
        date: "2026-11-10",
        createdAt: "2026-11-10T10:00:00.000Z",
        updatedAt: "2026-11-10T10:00:00.000Z",
      },
    ]);
    const repoB = createMemoryRepository([
      {
        id: "tx-b-1",
        type: "expense",
        description: "Aluguel B",
        amountCents: 180000,
        categoryId: "housing",
        date: "2026-11-12",
        createdAt: "2026-11-12T10:00:00.000Z",
        updatedAt: "2026-11-12T10:00:00.000Z",
      },
    ]);

    const hookA = renderHook(
      () => ({
        query: useTransactions(repoA),
        mutations: useTransactionMutations(repoA),
      }),
      { wrapper: createWrapper(sharedClient, makeUser("user-a")) },
    );
    await waitFor(() => expect(hookA.result.current.query.isSuccess).toBe(true));
    expect(hookA.result.current.query.data?.[0]?.description).toBe("Salário A");

    await hookA.result.current.mutations.create.mutateAsync({
      type: "expense",
      description: "Mercado A",
      amountCents: 12500,
      categoryId: "food",
      date: "2026-11-24",
    });
    await waitFor(() => expect(hookA.result.current.query.data).toHaveLength(2));

    const hookB = renderHook(() => useTransactions(repoB), {
      wrapper: createWrapper(sharedClient, makeUser("user-b")),
    });
    await waitFor(() => expect(hookB.result.current.isSuccess).toBe(true));
    expect(hookB.result.current.data).toHaveLength(1);
    expect(hookB.result.current.data?.[0]?.description).toBe("Aluguel B");
  });
});
