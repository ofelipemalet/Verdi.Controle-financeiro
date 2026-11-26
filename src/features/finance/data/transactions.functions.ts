import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { isCategoryOfType, type CategoryId } from "../model/categories";
import { createTransactionInputSchema } from "../model/schema";
import type { Transaction, TransactionInput, TransactionType } from "../model/types";

const MAX_LIST_TRANSACTIONS = 1000;
const SELECT_COLUMNS =
  "id, type, description, amount_cents, category_id, date, created_at, updated_at" as const;

const transactionIdSchema = z.string().uuid("Identificador de movimentação inválido");

interface TransactionRow {
  id: string;
  type: string;
  description: string;
  amount_cents: number;
  category_id: string;
  date: string;
  created_at: string;
  updated_at: string;
}

function setPrivateNoStore(): void {
  setResponseHeader("Cache-Control", "private, no-store");
}

function mapRowToTransaction(row: TransactionRow): Transaction {
  if (row.type !== "income" && row.type !== "expense") {
    throw new Error("Registro financeiro inválido.");
  }
  const type: TransactionType = row.type;
  if (!isCategoryOfType(row.category_id, type)) {
    throw new Error("Categoria financeira inválida.");
  }
  return {
    id: row.id,
    type,
    description: row.description,
    amountCents: Number(row.amount_cents),
    categoryId: row.category_id as CategoryId,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateTransactionInput(input: TransactionInput): TransactionInput {
  return createTransactionInputSchema(new Date()).parse(input);
}

export const listTransactionsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Transaction[]> => {
    setPrivateNoStore();
    const { data, error } = await context.supabase
      .from("transactions")
      .select(SELECT_COLUMNS)
      .eq("user_id", context.userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(MAX_LIST_TRANSACTIONS);

    if (error) {
      console.error("[transactions:list]", error);
      throw new Error("Não foi possível carregar suas movimentações.");
    }

    return (data ?? []).map(mapRowToTransaction);
  });

export const createTransactionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: TransactionInput) => validateTransactionInput(input))
  .handler(async ({ data, context }): Promise<Transaction> => {
    setPrivateNoStore();
    const { data: created, error } = await context.supabase
      .from("transactions")
      .insert({
        user_id: context.userId,
        type: data.type,
        description: data.description,
        amount_cents: data.amountCents,
        category_id: data.categoryId,
        date: data.date,
      })
      .select(SELECT_COLUMNS)
      .single();

    if (error || !created) {
      console.error("[transactions:create]", error);
      throw new Error("Não foi possível salvar a movimentação.");
    }

    return mapRowToTransaction(created);
  });

export const updateTransactionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((payload: { id: string; input: TransactionInput }) => ({
    id: transactionIdSchema.parse(payload.id),
    input: validateTransactionInput(payload.input),
  }))
  .handler(async ({ data, context }): Promise<Transaction> => {
    setPrivateNoStore();
    const { data: updated, error } = await context.supabase
      .from("transactions")
      .update({
        type: data.input.type,
        description: data.input.description,
        amount_cents: data.input.amountCents,
        category_id: data.input.categoryId,
        date: data.input.date,
      })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select(SELECT_COLUMNS)
      .maybeSingle();

    if (error) {
      console.error("[transactions:update]", error);
      throw new Error("Não foi possível atualizar a movimentação.");
    }

    if (!updated) {
      throw new Error("Movimentação não encontrada.");
    }

    return mapRowToTransaction(updated);
  });

export const deleteTransactionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((payload: { id: string }) => ({
    id: transactionIdSchema.parse(payload.id),
  }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    setPrivateNoStore();
    const { data: deleted, error } = await context.supabase
      .from("transactions")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[transactions:delete]", error);
      throw new Error("Não foi possível excluir a movimentação.");
    }

    if (!deleted) {
      throw new Error("Movimentação não encontrada.");
    }

    return { ok: true };
  });