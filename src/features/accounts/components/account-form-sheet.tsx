"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { Account, AccountKind } from "@/core/api/types";
import { formatMoneyCompact, parseMoneyInput } from "@/core/format/money";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

import { useCreateAccount, useUpdateAccount } from "../hooks/use-account-mutations";
import { accountFormSchema, type AccountFormInput } from "../schemas/account-form.schema";

interface AccountFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
}

const KINDS: { value: AccountFormInput["kind"]; label: string }[] = [
  { value: "CHECKING", label: "Conta corrente" },
  { value: "CASH", label: "Dinheiro" },
  { value: "SAVINGS", label: "Poupança" },
  { value: "INVESTMENT", label: "Investimento" },
];

export function AccountFormSheet({ open, onOpenChange, account }: AccountFormSheetProps) {
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const accountId = account?.id;
  const accountName = account?.name;
  const accountKind = account?.kind;
  const openingBalanceCents = account?.openingBalanceCents;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormInput>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { name: "", kind: "CHECKING", openingBalance: "" },
  });

  useEffect(() => {
    if (!open) return;

    if (accountId) {
      reset({
        name: accountName ?? "",
        kind: accountKind ?? ("CHECKING" as AccountKind),
        openingBalance: formatMoneyCompact(openingBalanceCents ?? 0),
      });
      return;
    }

    reset({ name: "", kind: "CHECKING", openingBalance: "" });
  }, [open, accountId, accountName, accountKind, openingBalanceCents, reset]);

  async function submit(values: AccountFormInput) {
    try {
      if (account) {
        await updateAccount.mutateAsync({
          id: account.id,
          input: {
            name: values.name,
            kind: values.kind,
            openingBalanceCents: parseMoneyInput(values.openingBalance ?? ""),
          },
        });
      } else {
        await createAccount.mutateAsync({
          name: values.name,
          kind: values.kind,
          openingBalanceCents: values.openingBalance
            ? parseMoneyInput(values.openingBalance)
            : undefined,
        });
      }
      onOpenChange(false);
    } catch {
      // The mutation hook shows the error toast; keep the sheet open for correction.
    }
  }

  const pending = isSubmitting || createAccount.isPending || updateAccount.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{account ? "Editar conta" : "Nova conta"}</SheetTitle>
        </SheetHeader>
        <form id="account-form" onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-name">Nome</Label>
            <Input id="account-name" {...register("name")} />
            {errors.name && <p className="text-small text-ember">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-kind">Tipo</Label>
            <Select id="account-kind" {...register("kind")}>
              {KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-balance">Saldo inicial (opcional)</Label>
            <Input id="account-balance" inputMode="decimal" placeholder="0,00" {...register("openingBalance")} />
          </div>
        </form>
        <SheetFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button form="account-form" type="submit" disabled={pending}>
            {account ? "Salvar alterações" : "Salvar conta"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
