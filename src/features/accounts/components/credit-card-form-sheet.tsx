"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { parseMoneyInput } from "@/core/format/money";
import { useAccountsQuery } from "@/shared/queries/use-accounts";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

import { useCreateCreditCard } from "../hooks/use-credit-card-mutations";
import { creditCardFormSchema, type CreditCardFormInput } from "../schemas/credit-card-form.schema";

interface CreditCardFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditCardFormSheet({ open, onOpenChange }: CreditCardFormSheetProps) {
  const { data: accounts = [] } = useAccountsQuery();
  const createCreditCard = useCreateCreditCard();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreditCardFormInput>({
    resolver: zodResolver(creditCardFormSchema),
    defaultValues: { accountId: "", name: "", limit: "", closingDay: 1, dueDay: 10 },
  });

  useEffect(() => {
    if (open) reset({ accountId: accounts[0]?.id ?? "", name: "", limit: "", closingDay: 1, dueDay: 10 });
  }, [open, accounts, reset]);

  async function submit(values: CreditCardFormInput) {
    await createCreditCard.mutateAsync({
      accountId: values.accountId,
      name: values.name,
      limitCents: parseMoneyInput(values.limit),
      closingDay: values.closingDay,
      dueDay: values.dueDay,
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Novo cartão</SheetTitle>
        </SheetHeader>
        <form id="credit-card-form" onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cc-name">Nome</Label>
            <Input id="cc-name" {...register("name")} />
            {errors.name && <p className="text-small text-ember">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cc-account">Conta de pagamento</Label>
            <Select id="cc-account" {...register("accountId")}>
              <option value="">Selecione</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
            {errors.accountId && <p className="text-small text-ember">{errors.accountId.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cc-limit">Limite</Label>
            <Input id="cc-limit" inputMode="decimal" placeholder="0,00" {...register("limit")} />
            {errors.limit && <p className="text-small text-ember">{errors.limit.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cc-closing">Fechamento (dia)</Label>
              <Input id="cc-closing" type="number" min={1} max={31} {...register("closingDay")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cc-due">Vencimento (dia)</Label>
              <Input id="cc-due" type="number" min={1} max={31} {...register("dueDay")} />
            </div>
          </div>
        </form>
        <SheetFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button form="credit-card-form" type="submit" disabled={isSubmitting}>
            Salvar cartão
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
