"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { proxyFetch } from "@/core/api/client-fetch";
import { ApiRequestError } from "@/core/api/errors";
import type { CreditCard, Invoice } from "@/core/api/types";
import { queryKeys } from "@/shared/queries/keys";

export interface CreateCreditCardInput {
  accountId: string;
  name: string;
  limitCents: number;
  closingDay: number;
  dueDay: number;
}

export function useCreateCreditCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCreditCardInput) =>
      proxyFetch<CreditCard>("/credit-cards", { method: "POST", body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.creditCards() });
      toast.success("Cartão criado.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível criar o cartão.");
    },
  });
}

export function useInvoiceQuery(creditCardId: string, month: string) {
  return useQuery({
    queryKey: queryKeys.invoice(creditCardId, month),
    queryFn: () => proxyFetch<Invoice>(`/credit-cards/${creditCardId}/invoices`, { query: { month } }),
  });
}
