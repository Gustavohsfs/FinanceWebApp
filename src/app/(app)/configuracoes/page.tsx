import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { authApi } from "@/core/api/resources";
import { getSession } from "@/core/auth/session";
import { SettingsView } from "@/features/settings";

export const metadata: Metadata = { title: "Configurações — Fluxo" };

export default async function ConfiguracoesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await authApi.me(session.accessToken);

  return <SettingsView user={user} />;
}
