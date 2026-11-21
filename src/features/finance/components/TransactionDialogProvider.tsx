import { Loader2 } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getErrorMessage } from "../data";
import { useTransactionMutations } from "../hooks/use-transactions";
import { toISODate } from "../model/dates";
import { formatCurrency } from "../model/money";
import type { TransactionFormInput } from "../model/schema";
import type { Transaction, TransactionInput, TransactionType } from "../model/types";
import { TransactionForm } from "./TransactionForm";

type FormState =
  { mode: "create"; type: TransactionType } | { mode: "edit"; transaction: Transaction };

interface TransactionDialogContextValue {
  openCreate: (type: TransactionType) => void;
  openEdit: (transaction: Transaction) => void;
  openDelete: (transaction: Transaction) => void;
}

const TransactionDialogContext = createContext<TransactionDialogContextValue | null>(null);

function toFormValues(state: FormState): TransactionFormInput {
  if (state.mode === "edit") {
    const { type, description, amountCents, categoryId, date } = state.transaction;
    return { type, description, amountCents, categoryId, date };
  }
  return {
    type: state.type,
    description: "",
    amountCents: 0,
    categoryId: "",
    date: toISODate(new Date()),
  };
}

export function TransactionDialogProvider({ children }: { children: ReactNode }) {
  const { create, update, remove } = useTransactionMutations();
  const [formState, setFormState] = useState<FormState | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const openForm = useCallback((state: FormState) => {
    setFormState(state);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }, []);

  const contextValue = useMemo<TransactionDialogContextValue>(
    () => ({
      openCreate: (type) => openForm({ mode: "create", type }),
      openEdit: (transaction) => openForm({ mode: "edit", transaction }),
      openDelete: (transaction) => {
        setPendingDelete(transaction);
        setDeleteOpen(true);
      },
    }),
    [openForm],
  );

  const handleSubmit = async (input: TransactionInput) => {
    if (!formState) return;
    if (formState.mode === "edit") {
      await update.mutateAsync({ id: formState.transaction.id, input });
      toast.success("Movimentação atualizada");
    } else {
      await create.mutateAsync(input);
      toast.success(input.type === "income" ? "Receita adicionada" : "Despesa adicionada");
    }
    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      toast.success("Movimentação excluída");
      setDeleteOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const isEditing = formState?.mode === "edit";
  const formType = formState?.mode === "edit" ? formState.transaction.type : formState?.type;

  return (
    <TransactionDialogContext.Provider value={contextValue}>
      {children}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl">
              {isEditing
                ? "Editar movimentação"
                : formType === "income"
                  ? "Nova receita"
                  : "Nova despesa"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Altere os dados e salve para atualizar seus indicadores."
                : "Preencha os dados da movimentação."}
            </DialogDescription>
          </DialogHeader>
          {formState && (
            <TransactionForm
              key={formKey}
              defaultValues={toFormValues(formState)}
              submitLabel={isEditing ? "Salvar alterações" : "Adicionar"}
              onSubmit={handleSubmit}
              onCancel={() => setFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="font-display">Excluir movimentação?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.description}" no valor de ${formatCurrency(pendingDelete.amountCents)} será removida permanentemente.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={remove.isPending}>
              {remove.isPending && <Loader2 className="animate-spin" aria-hidden />}
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TransactionDialogContext.Provider>
  );
}

export function useTransactionDialog(): TransactionDialogContextValue {
  const context = useContext(TransactionDialogContext);
  if (!context) {
    throw new Error("useTransactionDialog must be used within TransactionDialogProvider");
  }
  return context;
}
