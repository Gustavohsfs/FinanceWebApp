import Link from "next/link";
import type { Metadata } from "next";

import { LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Entrar — Fluxo" };

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-display font-semibold text-bone">Entrar</h1>
        <p className="text-body text-bone-600">Acesse sua conta para continuar.</p>
      </div>
      <LoginForm next={next} />
      <p className="text-small text-bone-600">
        Ainda não tem conta?{" "}
        <Link href="/registrar" className="text-bone underline underline-offset-2">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
