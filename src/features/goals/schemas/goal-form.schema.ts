import { z } from "zod";

export const goalFormSchema = z
  .object({
    name: z.string().trim().min(1, "Informe um nome").max(50),
    kind: z.enum(["SAVING", "INVESTMENT", "SPEND_LIMIT"]),
    target: z.string().min(1, "Informe o valor alvo"),
    categoryId: z.string().uuid().optional(),
    startDate: z.string().min(1, "Informe o início"),
    deadline: z.string().min(1, "Informe o prazo"),
    recurrence: z.enum(["ONCE", "MONTHLY"]),
  })
  .superRefine((value, ctx) => {
    if (value.kind === "SPEND_LIMIT" && !value.categoryId) {
      ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Limite de gasto exige uma categoria" });
    }
  });

export type GoalFormInput = z.infer<typeof goalFormSchema>;
