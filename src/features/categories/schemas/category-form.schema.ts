import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(40),
  icon: z.string().min(1, "Escolha um ícone"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor hexadecimal, ex.: #FF6A00"),
  type: z.enum(["INCOME", "EXPENSE"]),
  monthlyBudget: z.string().optional(),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
