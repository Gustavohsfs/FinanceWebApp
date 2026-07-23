import Link from "next/link";
import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = { title: "Criar conta — Fluxo" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-display font-semibold text-bone">Criar conta</h1>
        <p className="text-body text-bone-600">Leva menos de um minuto.</p>
      </div>
      <RegisterForm />
      <p className="text-small text-bone-600">
        Já tem conta?{" "}
        <Link href="/login" className="text-bone underline underline-offset-2">
          Entrar
        </Link>
      </p>
    </div>
  );
}
