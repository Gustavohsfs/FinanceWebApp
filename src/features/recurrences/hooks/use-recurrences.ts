"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { proxyFetch } from "@/core/api/client-fetch";
import { ApiRequestError } from "@/core/api/errors";
import type { PaymentMethod, Recurrence, Transaction } from "@/core/api/types";
import { queryKeys } from "@/shared/queries/keys";

export function useRecurrencesQuery() {
  return useQuery({
    queryKey: queryKeys.recurrences(),
    queryFn: () => proxyFetch<Recurrence[]>("/recurrences"),
  });
}

export interface CreateRecurrenceInput {
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  description: string;
  categoryId?: string;
  accountId: string;
  creditCardId?: string;
  paymentMethod: PaymentMethod;
  dayOfMonth: number;
  nextOccurrenceAt: string;
}

export function useCreateRecurrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRecurrenceInput) =>
      proxyFetch<Recurrence>("/recurrences", { method: "POST", body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.recurrences() });
      toast.success("Recorrência criada.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível criar a recorrência.");
    },
  });
}

export function useConfirmRecurrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proxyFetch<Transaction>(`/recurrences/${id}/confirm`, { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.recurrences() });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["insights"] });
      toast.success("Recorrência confirmada.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível confirmar.");
    },
  });
}
