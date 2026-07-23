import { z } from "zod";

export const accountFormSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(80),
  kind: z.enum(["CHECKING", "CASH", "SAVINGS", "INVESTMENT"]),
  openingBalance: z.string().optional(),
});

export type AccountFormInput = z.infer<typeof accountFormSchema>;
