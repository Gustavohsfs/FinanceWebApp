import type { Metadata } from "next";

import { AccountsView } from "@/features/accounts";

export const metadata: Metadata = { title: "Contas e cartões — Fluxo" };

export default function ContasPage() {
  return <AccountsView />;
}
