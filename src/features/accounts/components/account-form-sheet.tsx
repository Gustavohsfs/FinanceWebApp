"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { parseMoneyInput } from "@/core/format/money";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

import { useCreateAccount } from "../hooks/use-account-mutations";
import { accountFormSchema, type AccountFormInput } from "../schemas/account-form.schema";

interface AccountFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KINDS: { value: AccountFormInput["kind"]; label: string }[] = [
  { value: "CHECKING", label: "Conta corrente" },
  { value: "CASH", label: "Dinheiro" },
  { value: "SAVINGS", label: "Poupança" },
  { value: "INVESTMENT", label: "Investimento" },
];

export function AccountFormSheet({ open, onOpenChange }: AccountFormSheetProps) {
  const createAccount = useCreateAccount();
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
    if (open) reset({ name: "", kind: "CHECKING", openingBalance: "" });
  }, [open, reset]);

  async function submit(values: AccountFormInput) {
    await createAccount.mutateAsync({
      name: values.name,
      kind: values.kind,
      openingBalanceCents: values.openingBalance ? parseMoneyInput(values.openingBalance) : undefined,
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova conta</SheetTitle>
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
          <Button form="account-form" type="submit" disabled={isSubmitting}>
            Salvar conta
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
