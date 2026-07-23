"use client";

import { useQuery } from "@tanstack/react-query";

import { proxyFetch } from "@/core/api/client-fetch";
import type { Category, CategoryType } from "@/core/api/types";

import { queryKeys } from "./keys";

export function useCategoriesQuery(params?: { type?: CategoryType; includeArchived?: boolean }) {
  return useQuery({
    queryKey: queryKeys.categories(params),
    queryFn: () =>
      proxyFetch<Category[]>("/categories", {
        query: { type: params?.type, includeArchived: params?.includeArchived },
      }),
  });
}
