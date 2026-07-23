import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { transactionsApi } from "@/core/api/resources";
import { getSession } from "@/core/auth/session";
import { currentMonthKey, monthRangeUTC } from "@/core/format/date";
import { getQueryClient } from "@/core/query/get-query-client";
import { TransactionsView } from "@/features/transactions";
import { queryKeys } from "@/shared/queries/keys";

export const metadata: Metadata = { title: "Lançamentos — Fluxo" };

export default async function LancamentosPage() {
  const session = await getSession();
  const queryClient = getQueryClient();
  const range = monthRangeUTC(currentMonthKey());
  const filters = { basis: "accrual" as const, from: range.from, to: range.to, limit: 50 };

  if (session) {
    await queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.transactions(filters),
      queryFn: () => transactionsApi.list(session.accessToken, filters),
      initialPageParam: undefined,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionsView />
    </HydrationBoundary>
  );
}
