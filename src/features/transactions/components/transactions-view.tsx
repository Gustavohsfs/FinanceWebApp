"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import type { Transaction } from "@/core/api/types";
import { currentMonthKey, monthRangeUTC } from "@/core/format/date";
import { useCategoriesQuery } from "@/shared/queries/use-categories";
import { Button } from "@/shared/ui/button";
import { ErrorState } from "@/shared/components/error-state";

import { useTransactionsInfiniteQuery, type TransactionsFilters } from "../hooks/use-transactions-query";
import { TransactionFormSheet } from "./transaction-form-sheet";
import { TransactionsFiltersBar } from "./transactions-filters";
import { TransactionsTable } from "./transactions-table";

interface TransactionsViewProps {
  fixedType?: "INCOME" | "EXPENSE";
  createLabel?: string;
}

export function TransactionsView({ fixedType, createLabel = "Novo lançamento" }: TransactionsViewProps) {
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [filters, setFilters] = useState<Omit<TransactionsFilters, "from" | "to">>({
    basis: "accrual",
    type: fixedType,
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>(undefined);

  const range = useMemo(() => monthRangeUTC(monthKey), [monthKey]);
  const fullFilters: TransactionsFilters = { ...filters, from: range.from, to: range.to, limit: 50 };

  const { data: categories = [] } = useCategoriesQuery();
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTransactionsInfiniteQuery(fullFilters);

  const transactions = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TransactionsFiltersBar
          monthKey={monthKey}
          onMonthChange={setMonthKey}
          filters={{ ...filters, from: range.from, to: range.to }}
          onFiltersChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
          hideTypeFilter={!!fixedType}
        />
        <Button
          onClick={() => {
            setEditing(undefined);
            setSheetOpen(true);
          }}
        >
          <Plus className="size-4" /> {createLabel}
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <TransactionsTable
          transactions={transactions}
          categories={categories}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          onEdit={(transaction) => {
            setEditing(transaction);
            setSheetOpen(true);
          }}
        />
      )}

      <TransactionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        transaction={editing}
        defaultType={fixedType}
      />
    </div>
  );
}
