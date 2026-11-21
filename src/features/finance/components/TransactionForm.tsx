import { zodResolver } from "@hookform/resolvers/zod";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { SegmentedControl, type SegmentedOption } from "@/components/common/SegmentedControl";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { getErrorMessage } from "../data";
import { getCategoriesByType, isCategoryOfType } from "../model/categories";
import { MIN_TRANSACTION_DATE, getMaxTransactionDate } from "../model/dates";
import {
  DESCRIPTION_MAX_LENGTH,
  createTransactionInputSchema,
  type TransactionFormInput,
} from "../model/schema";
import type { TransactionInput, TransactionType } from "../model/types";
import { CategoryIcon } from "./CategoryIcon";
import { CurrencyInput } from "./CurrencyInput";

const TYPE_OPTIONS: readonly SegmentedOption<TransactionType>[] = [
  { value: "income", label: "Receita", icon: ArrowDownLeft, tone: "income" },
  { value: "expense", label: "Despesa", icon: ArrowUpRight, tone: "expense" },
];

interface TransactionFormProps {
  defaultValues: TransactionFormInput;
  submitLabel: string;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onCancel: () => void;
}

export function TransactionForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const today = useMemo(() => new Date(), []);
  const schema = useMemo(() => createTransactionInputSchema(today), [today]);
  const form = useForm<TransactionFormInput, unknown, TransactionInput>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const type = form.watch("type");
  const categories = getCategoriesByType(type);
  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      form.setError("root", { message: getErrorMessage(error) });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <SegmentedControl
                ariaLabel="Tipo de movimentação"
                options={TYPE_OPTIONS}
                value={field.value}
                onChange={(next) => {
                  field.onChange(next);
                  if (!isCategoryOfType(form.getValues("categoryId"), next)) {
                    form.setValue("categoryId", "", { shouldValidate: false });
                    form.clearErrors("categoryId");
                  }
                }}
                className="w-full"
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amountCents"
          render={({ field }) => (
            <FormItem className="rounded-2xl bg-muted px-4 py-3">
              <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Valor
              </FormLabel>
              <FormControl>
                <CurrencyInput
                  ref={field.ref}
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  autoComplete="off"
                  placeholder={type === "income" ? "Ex.: Salário de novembro" : "Ex.: Mercado"}
                  className="h-11 rounded-xl bg-card"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <ToggleGroupPrimitive.Root
                  type="single"
                  value={field.value}
                  onValueChange={(next) => {
                    if (next) field.onChange(next);
                  }}
                  aria-label="Categoria"
                  className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                >
                  {categories.map((category) => (
                    <ToggleGroupPrimitive.Item
                      key={category.id}
                      value={category.id}
                      className="press flex cursor-pointer items-center gap-2 rounded-2xl border border-border bg-card p-2 text-left text-sm font-medium text-foreground hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:border-primary data-[state=on]:bg-primary-soft"
                    >
                      <CategoryIcon categoryId={category.id} size="sm" />
                      <span className="truncate">{category.label}</span>
                    </ToggleGroupPrimitive.Item>
                  ))}
                </ToggleGroupPrimitive.Root>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  min={MIN_TRANSACTION_DATE}
                  max={getMaxTransactionDate(today)}
                  className="h-11 rounded-xl bg-card"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message && (
          <p role="alert" className="rounded-xl bg-expense-soft px-3 py-2 text-sm text-expense">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
