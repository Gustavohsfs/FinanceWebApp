"use client";

import { useQuery } from "@tanstack/react-query";

import { proxyFetch } from "@/core/api/client-fetch";
import type { Account } from "@/core/api/types";

import { queryKeys } from "./keys";

export function useAccountsQuery() {
  return useQuery({
    queryKey: queryKeys.accounts(),
    queryFn: () => proxyFetch<Account[]>("/accounts"),
  });
}
