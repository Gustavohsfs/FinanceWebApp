import type { Metadata } from "next";

import { ReportsView } from "@/features/reports";

export const metadata: Metadata = { title: "Relatórios — Fluxo" };

export default function RelatoriosPage() {
  return <ReportsView />;
}
