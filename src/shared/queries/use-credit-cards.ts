"use client";

import { useQuery } from "@tanstack/react-query";

import { proxyFetch } from "@/core/api/client-fetch";
import type { CreditCard } from "@/core/api/types";

import { queryKeys } from "./keys";

export function useCreditCardsQuery() {
  return useQuery({
    queryKey: queryKeys.creditCards(),
    queryFn: () => proxyFetch<CreditCard[]>("/credit-cards"),
  });
}
