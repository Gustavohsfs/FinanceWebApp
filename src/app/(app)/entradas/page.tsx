import type { Metadata } from "next";

import { RecurrencesSection } from "@/features/recurrences";
import { TransactionsView } from "@/features/transactions";

export const metadata: Metadata = { title: "Entradas — Fluxo" };

export default function EntradasPage() {
  return (
    <div className="flex flex-col gap-6">
      <RecurrencesSection type="INCOME" />
      <TransactionsView fixedType="INCOME" createLabel="Nova entrada" />
    </div>
  );
}
