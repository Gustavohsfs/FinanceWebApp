import { z } from "zod";

export const recurrenceFormSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.string().min(1, "Informe o valor"),
  description: z.string().trim().min(1, "Informe uma descrição").max(120),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid("Selecione uma conta"),
  creditCardId: z.string().uuid().optional(),
  paymentMethod: z.enum(["CASH", "PIX", "DEBIT", "CREDIT"]),
  dayOfMonth: z.coerce.number().int().min(1).max(31),
  nextOccurrenceAt: z.string().min(1, "Informe a próxima data"),
});

export type RecurrenceFormInput = z.infer<typeof recurrenceFormSchema>;
