import { z } from "zod";

export const creditCardFormSchema = z.object({
  accountId: z.string().uuid("Selecione uma conta"),
  name: z.string().trim().min(1, "Informe um nome").max(80),
  limit: z.string().min(1, "Informe o limite"),
  closingDay: z.coerce.number().int().min(1).max(31),
  dueDay: z.coerce.number().int().min(1).max(31),
});

export type CreditCardFormInput = z.infer<typeof creditCardFormSchema>;
