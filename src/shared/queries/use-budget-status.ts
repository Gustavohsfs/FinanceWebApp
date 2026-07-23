"use client";

import { useQuery } from "@tanstack/react-query";

import { proxyFetch } from "@/core/api/client-fetch";
import type { AggregationBasis, BudgetStatus } from "@/core/api/types";

import { queryKeys } from "./keys";

export function useBudgetStatusQuery(month: string, basis: AggregationBasis) {
  return useQuery({
    queryKey: queryKeys.insightsBudgetStatus(month, basis),
    queryFn: () => proxyFetch<BudgetStatus[]>("/insights/budget-status", { query: { month, basis } }),
  });
}
