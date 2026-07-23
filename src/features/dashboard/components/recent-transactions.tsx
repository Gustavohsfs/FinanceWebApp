import Link from "next/link";

import type { Category, Transaction } from "@/core/api/types";
import { dayLabel } from "@/core/format/date";
import { CategoryBadge } from "@/shared/components/category-badge";
import { EmptyState } from "@/shared/components/empty-state";
import { MoneyText } from "@/shared/components/money-text";
import { Card } from "@/shared/ui/card";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  selectedCategoryId: string | null;
}

export function RecentTransactions({ transactions, categories, selectedCategoryId }: RecentTransactionsProps) {
  const filtered = selectedCategoryId
    ? transactions.filter((t) => t.categoryId === selectedCategoryId)
    : transactions;
  const recent = [...filtered]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 8);

  return (
    <Card>
      <Card.Header className="flex-row items-center justify-between">
        <Card.Title>Últimos lançamentos</Card.Title>
        <Link href="/lancamentos" className="text-small text-bone-600 underline underline-offset-2">
          Ver todos
        </Link>
      </Card.Header>
      <Card.Body>
        {recent.length === 0 ? (
          <EmptyState title="Nada por aqui ainda." description="Registre o primeiro lançamento do mês." />
        ) : (
          <ul className="flex flex-col divide-y divide-ink-800">
            {recent.map((transaction) => {
              const category = categories.find((c) => c.id === transaction.categoryId);
              const signed = transaction.type === "EXPENSE" ? -transaction.amountCents : transaction.amountCents;
              return (
                <li key={transaction.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-small text-bone">
                      {transaction.description || category?.name || "—"}
                    </span>
                    <div className="flex items-center gap-2 text-micro text-bone-800">
                      <span>{dayLabel(transaction.occurredAt)}</span>
                      {category && <CategoryBadge name={category.name} color={category.color} />}
                    </div>
                  </div>
                  <MoneyText cents={signed} signed projected={transaction.isProjected} className="shrink-0" />
                </li>
              );
            })}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
}
