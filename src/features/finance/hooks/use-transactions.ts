import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthenticatedUser } from "@/features/auth/auth-context";

import { transactionRepository, type TransactionRepository } from "../data";
import type { TransactionInput } from "../model/types";

export function getTransactionsQueryKey(userId?: string) {
  return ["transactions", userId ?? "guest"] as const;
}

export function useTransactions(repository: TransactionRepository = transactionRepository) {
  const user = useAuthenticatedUser();
  const queryKey = getTransactionsQueryKey(user?.id);

  return useQuery({
    queryKey,
    queryFn: () => repository.list(),
    retry: false,
    staleTime: 30_000,
  });
}

export function useTransactionsSync(repository: TransactionRepository = transactionRepository): void {
  const queryClient = useQueryClient();
  const user = useAuthenticatedUser();
  const queryKey = getTransactionsQueryKey(user?.id);

  useEffect(
    () =>
      repository.subscribe(() => {
        void queryClient.invalidateQueries({ queryKey });
      }),
    [queryClient, queryKey, repository],
  );
}

export function useTransactionMutations(repository: TransactionRepository = transactionRepository) {
  const queryClient = useQueryClient();
  const user = useAuthenticatedUser();
  const queryKey = getTransactionsQueryKey(user?.id);
  const onSuccess = () => queryClient.invalidateQueries({ queryKey });

  const create = useMutation({
    mutationFn: (input: TransactionInput) => repository.create(input),
    onSuccess,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) =>
      repository.update(id, input),
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: (id: string) => repository.remove(id),
    onSuccess,
  });

  return { create, update, remove };
}
