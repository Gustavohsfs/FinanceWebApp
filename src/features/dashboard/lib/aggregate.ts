import type { AggregationBasis, Transaction } from "@/core/api/types";
import { dayKey } from "@/core/format/date";

/**
 * Agregação PURA para o gráfico herói do dashboard (BRIEF §6.4). Opera sobre
 * transações já buscadas do servidor — não decide saldo autoritativo, só
 * apresenta a mesma lista de formas diferentes (guardrail §10.12).
 */
export interface DayPoint {
  day: string;
  index: number;
  cumulativeBalanceCents: number;
  cumulativeIncomeCents: number;
  cumulativeExpenseCents: number;
}

function basisDate(transaction: Transaction, basis: AggregationBasis): string {
  if (basis === "cash") return transaction.settledAt ?? transaction.occurredAt;
  return transaction.occurredAt;
}

export function buildCumulativeSeries(
  transactions: readonly Transaction[],
  basis: AggregationBasis,
): DayPoint[] {
  const alive = transactions.filter((t) => t.deletedAt === null && t.type !== "TRANSFER");
  const byDay = new Map<string, { income: number; expense: number }>();

  for (const transaction of alive) {
    const key = dayKey(basisDate(transaction, basis));
    const entry = byDay.get(key) ?? { income: 0, expense: 0 };
    if (transaction.type === "INCOME") entry.income += transaction.amountCents;
    else entry.expense += transaction.amountCents;
    byDay.set(key, entry);
  }

  const days = [...byDay.keys()].sort();
  let runningBalance = 0;
  let runningIncome = 0;
  let runningExpense = 0;

  return days.map((day, index) => {
    const entry = byDay.get(day);
    runningIncome += entry?.income ?? 0;
    runningExpense += entry?.expense ?? 0;
    runningBalance = runningIncome - runningExpense;
    return {
      day,
      index,
      cumulativeBalanceCents: runningBalance,
      cumulativeIncomeCents: runningIncome,
      cumulativeExpenseCents: runningExpense,
    };
  });
}
