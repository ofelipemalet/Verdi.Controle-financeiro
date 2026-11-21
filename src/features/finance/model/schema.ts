import { z } from "zod";

import { isCategoryId, isCategoryOfType } from "./categories";
import {
  MIN_TRANSACTION_DATE,
  formatShortDate,
  getMaxTransactionDate,
  isValidISODate,
} from "./dates";
import { MAX_AMOUNT_CENTS, formatCurrency } from "./money";
import { TRANSACTION_TYPES } from "./types";

export const DESCRIPTION_MIN_LENGTH = 2;
export const DESCRIPTION_MAX_LENGTH = 80;

const FORBIDDEN_DESCRIPTION_CHARS = /[<>]/;

function isInvisibleCodePoint(codePoint: number): boolean {
  return (
    codePoint <= 0x1f ||
    (codePoint >= 0x7f && codePoint <= 0x9f) ||
    (codePoint >= 0x200b && codePoint <= 0x200f) ||
    (codePoint >= 0x2028 && codePoint <= 0x202e) ||
    (codePoint >= 0x2060 && codePoint <= 0x206f) ||
    codePoint === 0xfeff
  );
}

export function sanitizeText(value: string): string {
  return Array.from(value.normalize("NFC"))
    .map((char) => {
      const codePoint = char.codePointAt(0) ?? 0;
      if (codePoint === 0x09 || codePoint === 0x0a || codePoint === 0x0d) return " ";
      return isInvisibleCodePoint(codePoint) ? "" : char;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

const descriptionSchema = z
  .string({ required_error: "Informe uma descrição" })
  .transform(sanitizeText)
  .pipe(
    z
      .string()
      .min(DESCRIPTION_MIN_LENGTH, `Use pelo menos ${DESCRIPTION_MIN_LENGTH} caracteres`)
      .max(DESCRIPTION_MAX_LENGTH, `Use no máximo ${DESCRIPTION_MAX_LENGTH} caracteres`)
      .refine((value) => !FORBIDDEN_DESCRIPTION_CHARS.test(value), {
        message: "Não use os caracteres < ou >",
      }),
  );

const amountSchema = z
  .number({ required_error: "Informe um valor", invalid_type_error: "Informe um valor válido" })
  .int("Informe um valor válido")
  .positive("Informe um valor maior que zero")
  .max(MAX_AMOUNT_CENTS, `O valor máximo é ${formatCurrency(MAX_AMOUNT_CENTS)}`);

const categorySchema = z
  .string({ required_error: "Selecione uma categoria" })
  .refine(isCategoryId, { message: "Selecione uma categoria" });

const isoDateSchema = z
  .string({ required_error: "Informe a data" })
  .refine(isValidISODate, { message: "Informe uma data válida" });

const baseTransactionFields = {
  type: z.enum(TRANSACTION_TYPES, { errorMap: () => ({ message: "Tipo inválido" }) }),
  description: descriptionSchema,
  amountCents: amountSchema,
  categoryId: categorySchema,
};

export function createTransactionInputSchema(today: Date) {
  const maxDate = getMaxTransactionDate(today);
  return z
    .object({
      ...baseTransactionFields,
      date: isoDateSchema
        .refine((date) => date >= MIN_TRANSACTION_DATE, {
          message: `Use uma data a partir de ${formatShortDate(MIN_TRANSACTION_DATE)}`,
        })
        .refine((date) => date <= maxDate, {
          message: `Use uma data até ${formatShortDate(maxDate)}`,
        }),
    })
    .superRefine((value, ctx) => {
      if (!isCategoryOfType(value.categoryId, value.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["categoryId"],
          message: "Selecione uma categoria compatível com o tipo",
        });
      }
    });
}

export const storedTransactionSchema = z
  .object({
    ...baseTransactionFields,
    id: z.string().min(1).max(64),
    date: isoDateSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .refine((value) => isCategoryOfType(value.categoryId, value.type));

export type TransactionInputSchema = ReturnType<typeof createTransactionInputSchema>;
export type TransactionFormInput = z.input<TransactionInputSchema>;
