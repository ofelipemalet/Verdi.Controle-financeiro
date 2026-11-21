import { AlertTriangle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-4 py-10 text-center",
        className,
      )}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="surface-card flex flex-col items-center gap-4 p-10 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-expense-soft text-expense">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="font-semibold text-foreground">Não foi possível carregar seus dados</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button onClick={onRetry}>Tentar novamente</Button>
    </div>
  );
}

export function LoadingState() {
  return (
    <div aria-busy="true" aria-label="Carregando" className="grid gap-4 md:grid-cols-3">
      <Skeleton className="h-44 rounded-3xl md:col-span-3" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl md:col-span-2" />
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
