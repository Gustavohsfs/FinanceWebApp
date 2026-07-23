"use client";

import { useMemo, useState } from "react";

import { currentMonthKey, monthRangeUTC } from "@/core/format/date";
import type { AggregationBasis } from "@/core/api/types";
import { BasisToggle } from "@/shared/components/basis-toggle";
import { ErrorState } from "@/shared/components/error-state";
import { PeriodPicker } from "@/shared/components/period-picker";
import { useCategoriesQuery } from "@/shared/queries/use-categories";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

import { buildCumulativeSeries } from "../lib/aggregate";
import {
  useBudgetStatusQuery,
  useCategoryInsightsQuery,
  useMonthTransactionsQuery,
  useMonthlyComparisonQuery,
} from "../hooks/use-dashboard-queries";
import { BalanceHeroChart } from "./balance-hero-chart";
import { BudgetOverruns } from "./budget-overruns";
import { CategoryDonut } from "./category-donut";
import { MonthlyBars } from "./monthly-bars";
import { RecentTransactions } from "./recent-transactions";

export function DashboardView() {
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [basis, setBasis] = useState<AggregationBasis>("accrual");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const range = useMemo(() => monthRangeUTC(monthKey), [monthKey]);

  const { data: categories = [] } = useCategoriesQuery();
  const transactionsQuery = useMonthTransactionsQuery(range.from, range.to, basis);
  const categoryInsightsQuery = useCategoryInsightsQuery(range.from, range.to);
  const monthlyComparisonQuery = useMonthlyComparisonQuery(6);
  const budgetStatusQuery = useBudgetStatusQuery(monthKey, basis);

  const series = useMemo(
    () => buildCumulativeSeries(transactionsQuery.data?.data ?? [], basis),
    [transactionsQuery.data, basis],
  );

  if (transactionsQuery.isError) {
    return <ErrorState onRetry={() => transactionsQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <PeriodPicker monthKey={monthKey} onChange={setMonthKey} />
        <BasisToggle basis={basis} onChange={setBasis} />
      </div>

      <Card className="p-6">
        {transactionsQuery.isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <BalanceHeroChart data={series} monthLabel="este mês" />
        )}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Saídas por categoria</Card.Title>
          </Card.Header>
          <Card.Body>
            {categoryInsightsQuery.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <CategoryDonut
                data={categoryInsightsQuery.data ?? []}
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
              />
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Últimos 6 meses</Card.Title>
          </Card.Header>
          <Card.Body>
            {monthlyComparisonQuery.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <MonthlyBars data={monthlyComparisonQuery.data ?? []} />
            )}
          </Card.Body>
        </Card>
      </div>

      {!budgetStatusQuery.isLoading && <BudgetOverruns data={budgetStatusQuery.data ?? []} />}

      <RecentTransactions
        transactions={transactionsQuery.data?.data ?? []}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
      />
    </div>
  );
}
