"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { proxyFetch } from "@/core/api/client-fetch";
import { ApiRequestError } from "@/core/api/errors";
import type { Category, CategoryType } from "@/core/api/types";

export interface CategoryMutationInput {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  monthlyBudgetCents?: number;
}

function invalidateCategories(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["categories"] });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryMutationInput) =>
      proxyFetch<Category>("/categories", { method: "POST", body: input }),
    onSuccess: () => {
      invalidateCategories(queryClient);
      toast.success("Categoria criada.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível criar a categoria.");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryMutationInput> }) =>
      proxyFetch<Category>(`/categories/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => {
      invalidateCategories(queryClient);
      toast.success("Categoria atualizada.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível atualizar.");
    },
  });
}

export function useArchiveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proxyFetch<Category>(`/categories/${id}/archive`, { method: "POST" }),
    onSuccess: () => {
      invalidateCategories(queryClient);
      toast.success("Categoria arquivada.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível arquivar.");
    },
  });
}
