"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { proxyFetch } from "@/core/api/client-fetch";
import { ApiRequestError } from "@/core/api/errors";
import type { Account, AccountKind } from "@/core/api/types";
import { queryKeys } from "@/shared/queries/keys";

export interface CreateAccountInput {
  name: string;
  kind: AccountKind;
  openingBalanceCents?: number;
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountInput) => proxyFetch<Account>("/accounts", { method: "POST", body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      toast.success("Conta criada.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível criar a conta.");
    },
  });
}
