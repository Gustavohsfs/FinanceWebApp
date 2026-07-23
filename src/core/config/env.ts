import { z } from "zod";

const serverEnvSchema = z.object({
  API_URL: z.string().url(),
  AUTH_COOKIE_SECRET: z.string().min(16),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

function loadServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    API_URL: process.env.API_URL,
    AUTH_COOKIE_SECRET: process.env.AUTH_COOKIE_SECRET,
  });
  if (!parsed.success) {
    throw new Error(`Variáveis de ambiente do servidor inválidas: ${parsed.error.message}`);
  }
  return parsed.data;
}

function loadClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!parsed.success) {
    throw new Error(`Variáveis de ambiente do cliente inválidas: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const serverEnv = typeof window === "undefined" ? loadServerEnv() : (undefined as never);
export const clientEnv = loadClientEnv();
