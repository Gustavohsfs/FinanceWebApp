import type { Category, PaymentMethod, Transaction } from "@/core/api/types";

export const METHOD_ORDER: PaymentMethod[] = ["CASH", "PIX", "DEBIT", "CREDIT"];

export interface CrossTabRow {
  categoryId: string;
  categoryName: string;
  totalsByMethod: Record<PaymentMethod, number>;
  total: number;
}

/**
 * Cruzamento categoria × método, PURO — opera sobre transações já buscadas
 * do servidor, só reorganiza para exibição (guardrail §10.12).
 */
export function buildCrossTab(transactions: readonly Transaction[], categories: readonly Category[]): CrossTabRow[] {
  const expenses = transactions.filter((t) => t.type === "EXPENSE" && t.deletedAt === null);
  const rows = new Map<string, CrossTabRow>();

  for (const transaction of expenses) {
    const categoryId = transaction.categoryId ?? "sem-categoria";
    const categoryName = categories.find((c) => c.id === transaction.categoryId)?.name ?? "Sem categoria";
    const row =
      rows.get(categoryId) ??
      ({
        categoryId,
        categoryName,
        totalsByMethod: { CASH: 0, PIX: 0, DEBIT: 0, CREDIT: 0 },
        total: 0,
      } satisfies CrossTabRow);
    row.totalsByMethod[transaction.paymentMethod] += transaction.amountCents;
    row.total += transaction.amountCents;
    rows.set(categoryId, row);
  }

  return [...rows.values()].sort((a, b) => b.total - a.total);
}
