"use client";

import { useQuery } from "@tanstack/react-query";

import { proxyFetch } from "@/core/api/client-fetch";
import type {
  AggregationBasis,
  CategoryInsight,
  MonthlyComparison,
  SummaryResponse,
  TransactionsPage,
} from "@/core/api/types";
import { queryKeys } from "@/shared/queries/keys";

export { useBudgetStatusQuery } from "@/shared/queries/use-budget-status";

export function useMonthTransactionsQuery(from: string, to: string, basis: AggregationBasis) {
  return useQuery({
    queryKey: queryKeys.transactions({ from, to, basis, dashboard: true }),
    queryFn: () => proxyFetch<TransactionsPage>("/transactions", { query: { from, to, basis, limit: 100 } }),
  });
}

export function useSummaryQuery(month: string, basis: AggregationBasis) {
  return useQuery({
    queryKey: queryKeys.insightsSummary(month, basis),
    queryFn: () => proxyFetch<SummaryResponse>("/insights/summary", { query: { month, basis } }),
  });
}

export function useCategoryInsightsQuery(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.insightsByCategory(from, to, "EXPENSE"),
    queryFn: () =>
      proxyFetch<CategoryInsight[]>("/insights/by-category", { query: { from, to, type: "EXPENSE" } }),
  });
}

export function useMonthlyComparisonQuery(months = 6) {
  return useQuery({
    queryKey: queryKeys.insightsMonthlyComparison(months),
    queryFn: () => proxyFetch<MonthlyComparison[]>("/insights/monthly-comparison", { query: { months } }),
  });
}
