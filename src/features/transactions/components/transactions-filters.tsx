"use client";

import type { PaymentMethod, TransactionType } from "@/core/api/types";
import { BasisToggle } from "@/shared/components/basis-toggle";
import { PeriodPicker } from "@/shared/components/period-picker";
import { useAccountsQuery } from "@/shared/queries/use-accounts";
import { useCategoriesQuery } from "@/shared/queries/use-categories";
import { Select } from "@/shared/ui/select";

import type { TransactionsFilters } from "../hooks/use-transactions-query";

interface TransactionsFiltersBarProps {
  monthKey: string;
  onMonthChange: (monthKey: string) => void;
  filters: TransactionsFilters;
  onFiltersChange: (filters: Partial<TransactionsFilters>) => void;
  hideTypeFilter?: boolean;
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Dinheiro" },
  { value: "PIX", label: "Pix" },
  { value: "DEBIT", label: "Débito" },
  { value: "CREDIT", label: "Crédito" },
];

export function TransactionsFiltersBar({
  monthKey,
  onMonthChange,
  filters,
  onFiltersChange,
  hideTypeFilter = false,
}: TransactionsFiltersBarProps) {
  const { data: categories = [] } = useCategoriesQuery();
  const { data: accounts = [] } = useAccountsQuery();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <PeriodPicker monthKey={monthKey} onChange={onMonthChange} />
      <BasisToggle basis={filters.basis} onChange={(basis) => onFiltersChange({ basis })} />

      {!hideTypeFilter && (
        <Select
          className="w-auto"
          value={filters.type ?? ""}
          onChange={(event) =>
            onFiltersChange({ type: (event.target.value || undefined) as TransactionType | undefined })
          }
        >
          <option value="">Todos os tipos</option>
          <option value="INCOME">Entradas</option>
          <option value="EXPENSE">Saídas</option>
        </Select>
      )}

      <Select
        className="w-auto"
        value={filters.categoryId ?? ""}
        onChange={(event) => onFiltersChange({ categoryId: event.target.value || undefined })}
      >
        <option value="">Todas as categorias</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <Select
        className="w-auto"
        value={filters.method ?? ""}
        onChange={(event) =>
          onFiltersChange({ method: (event.target.value || undefined) as PaymentMethod | undefined })
        }
      >
        <option value="">Todos os métodos</option>
        {METHODS.map((method) => (
          <option key={method.value} value={method.value}>
            {method.label}
          </option>
        ))}
      </Select>

      <Select
        className="w-auto"
        value={filters.accountId ?? ""}
        onChange={(event) => onFiltersChange({ accountId: event.target.value || undefined })}
      >
        <option value="">Todas as contas</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
