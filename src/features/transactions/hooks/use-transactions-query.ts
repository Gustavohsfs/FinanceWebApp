"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { proxyFetch } from "@/core/api/client-fetch";
import type { AggregationBasis, PaymentMethod, TransactionsPage, TransactionType } from "@/core/api/types";
import { queryKeys } from "@/shared/queries/keys";

export interface TransactionsFilters {
  from?: string;
  to?: string;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  method?: PaymentMethod;
  basis: AggregationBasis;
  limit?: number;
}

export function useTransactionsInfiniteQuery(filters: TransactionsFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: ({ pageParam }) =>
      proxyFetch<TransactionsPage>("/transactions", {
        query: { ...filters, cursor: pageParam },
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.meta.hasMore ? (lastPage.meta.nextCursor ?? undefined) : undefined),
  });
}
