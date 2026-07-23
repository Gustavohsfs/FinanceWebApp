import { z } from "zod";

export const transactionFormSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.string().min(1, "Informe o valor"),
    description: z.string().max(120).optional(),
    occurredAt: z.string().min(1, "Informe a data"),
    categoryId: z.string().uuid().optional(),
    accountId: z.string().uuid("Selecione uma conta"),
    creditCardId: z.string().uuid().optional(),
    paymentMethod: z.enum(["CASH", "PIX", "DEBIT", "CREDIT"]),
    installmentTotal: z.coerce.number().int().min(1).max(24),
    notes: z.string().max(2_000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.installmentTotal > 1 && value.paymentMethod !== "CREDIT") {
      ctx.addIssue({
        code: "custom",
        path: ["installmentTotal"],
        message: "Parcelamento exige pagamento no crédito",
      });
    }
    if (value.paymentMethod === "CREDIT" && !value.creditCardId) {
      ctx.addIssue({ code: "custom", path: ["creditCardId"], message: "Selecione um cartão" });
    }
    if (!value.categoryId) {
      ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Selecione uma categoria" });
    }
  });

export type TransactionFormInput = z.infer<typeof transactionFormSchema>;
