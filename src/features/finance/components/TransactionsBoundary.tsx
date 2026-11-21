import type { ReactNode } from "react";

import { ErrorState, LoadingState } from "@/components/common/StatusViews";

import { getErrorMessage } from "../data";
import { useTransactions } from "../hooks/use-transactions";
import type { Transaction } from "../model/types";

interface TransactionsBoundaryProps {
  children: (transactions: Transaction[]) => ReactNode;
}

export function TransactionsBoundary({ children }: TransactionsBoundaryProps) {
  const query = useTransactions();

  if (query.isPending) return <LoadingState />;
  if (query.isError) {
    return (
      <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
    );
  }
  return <>{children(query.data)}</>;
}
