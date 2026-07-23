import { z } from "zod";

export const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual"),
  newPassword: z
    .string()
    .min(8, "Mínimo de 8 caracteres")
    .regex(/[a-z]/, "Inclua uma letra minúscula")
    .regex(/[A-Z]/, "Inclua uma letra maiúscula")
    .regex(/[0-9]/, "Inclua um número"),
});

export type PasswordFormInput = z.infer<typeof passwordFormSchema>;
