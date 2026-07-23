import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { insightsApi, transactionsApi } from "@/core/api/resources";
import { getSession } from "@/core/auth/session";
import { currentMonthKey, monthRangeUTC } from "@/core/format/date";
import { getQueryClient } from "@/core/query/get-query-client";
import { DashboardView } from "@/features/dashboard";
import { queryKeys } from "@/shared/queries/keys";

export const metadata: Metadata = { title: "Dashboard — Fluxo" };

export default async function DashboardPage() {
  const session = await getSession();
  const queryClient = getQueryClient();
  const monthKey = currentMonthKey();
  const range = monthRangeUTC(monthKey);
  const basis = "accrual" as const;

  if (session) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.transactions({ from: range.from, to: range.to, basis, dashboard: true }),
        queryFn: () =>
          transactionsApi.list(session.accessToken, { from: range.from, to: range.to, basis, limit: 100 }),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.insightsByCategory(range.from, range.to, "EXPENSE"),
        queryFn: () => insightsApi.byCategory(session.accessToken, range.from, range.to, "EXPENSE"),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.insightsMonthlyComparison(6),
        queryFn: () => insightsApi.monthlyComparison(session.accessToken, 6),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.insightsBudgetStatus(monthKey, basis),
        queryFn: () => insightsApi.budgetStatus(session.accessToken, monthKey, basis),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardView />
    </HydrationBoundary>
  );
}
