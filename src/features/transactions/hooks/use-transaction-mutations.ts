"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { proxyFetch } from "@/core/api/client-fetch";
import { newIdempotencyKey } from "@/core/api/id";
import { ApiRequestError } from "@/core/api/errors";
import type { CreateTransactionInput, EditScope, Transaction, UpdateTransactionInput } from "@/core/api/types";

function invalidateAfterMutation(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["transactions"] });
  void queryClient.invalidateQueries({ queryKey: ["insights"] });
  void queryClient.invalidateQueries({ queryKey: ["goals"] });
  void queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      proxyFetch<Transaction[]>("/transactions", {
        method: "POST",
        body: input,
        idempotencyKey: newIdempotencyKey(),
      }),
    onSuccess: () => {
      invalidateAfterMutation(queryClient);
      toast.success("Lançamento salvo.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível salvar.");
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
      scope = "one",
    }: {
      id: string;
      input: UpdateTransactionInput;
      scope?: EditScope;
    }) =>
      proxyFetch<Transaction[]>(`/transactions/${id}`, {
        method: "PATCH",
        body: input,
        query: { scope },
      }),
    onSuccess: () => {
      invalidateAfterMutation(queryClient);
      toast.success("Lançamento atualizado.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível atualizar.");
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scope = "one" }: { id: string; scope?: EditScope }) =>
      proxyFetch<void>(`/transactions/${id}`, { method: "DELETE", query: { scope } }),
    onSuccess: () => {
      invalidateAfterMutation(queryClient);
      toast.success("Lançamento excluído.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível excluir.");
    },
  });
}
