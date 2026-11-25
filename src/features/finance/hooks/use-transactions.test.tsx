import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { TRANSACTIONS_STORAGE_KEY } from "../data/local-storage-repository";
import { useTransactionMutations, useTransactions } from "./use-transactions";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useTransactions offline behavior", () => {
  beforeEach(() => {
    window.localStorage.clear();
    onlineManager.setOnline(false);
  });

  afterEach(() => {
    onlineManager.setOnline(true);
    window.localStorage.clear();
  });

  it("reads and persists saved transactions while offline", async () => {
    window.localStorage.setItem(
      TRANSACTIONS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        transactions: [
          {
            id: "tx-offline-1",
            type: "income",
            description: "Salário",
            amountCents: 500000,
            categoryId: "salary",
            date: "2026-11-10",
            createdAt: "2026-11-10T10:00:00.000Z",
            updatedAt: "2026-11-10T10:00:00.000Z",
          },
        ],
      }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => ({
        query: useTransactions(),
        mutations: useTransactionMutations(),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.data).toHaveLength(1);
    expect(result.current.query.data?.[0]?.description).toBe("Salário");

    await result.current.mutations.create.mutateAsync({
      type: "expense",
      description: "Mercado offline",
      amountCents: 12500,
      categoryId: "food",
      date: "2026-11-24",
    });

    await waitFor(() => expect(result.current.query.data).toHaveLength(2));
    expect(result.current.query.data?.some((t) => t.description === "Mercado offline")).toBe(true);
  });
});
