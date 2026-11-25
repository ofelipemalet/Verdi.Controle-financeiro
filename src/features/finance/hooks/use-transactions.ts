import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { transactionRepository } from "../data";
import type { TransactionInput } from "../model/types";

export const transactionsQueryKey = ["transactions"] as const;

export function useTransactions() {
  return useQuery({
    queryKey: transactionsQueryKey,
    queryFn: () => transactionRepository.list(),
    retry: false,
    staleTime: Infinity,
    networkMode: "always",
  });
}

export function useTransactionsSync(): void {
  const queryClient = useQueryClient();
  useEffect(
    () =>
      transactionRepository.subscribe(() => {
        void queryClient.invalidateQueries({ queryKey: transactionsQueryKey });
      }),
    [queryClient],
  );
}

export function useTransactionMutations() {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: transactionsQueryKey });

  const create = useMutation({
    mutationFn: (input: TransactionInput) => transactionRepository.create(input),
    networkMode: "always",
    onSuccess,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) =>
      transactionRepository.update(id, input),
    networkMode: "always",
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: (id: string) => transactionRepository.remove(id),
    networkMode: "always",
    onSuccess,
  });

  return { create, update, remove };
}
