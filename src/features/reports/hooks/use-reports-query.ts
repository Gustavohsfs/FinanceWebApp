"use client";

import { useQuery } from "@tanstack/react-query";

import { proxyFetch } from "@/core/api/client-fetch";
import type { AggregationBasis, TransactionsPage } from "@/core/api/types";
import { queryKeys } from "@/shared/queries/keys";

export function useReportTransactionsQuery(from: string, to: string, basis: AggregationBasis) {
  return useQuery({
    queryKey: queryKeys.transactions({ from, to, basis, report: true }),
    queryFn: () => proxyFetch<TransactionsPage>("/transactions", { query: { from, to, basis, limit: 100 } }),
  });
}
