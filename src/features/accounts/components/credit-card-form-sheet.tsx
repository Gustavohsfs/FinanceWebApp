"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { CreditCard } from "@/core/api/types";
import { formatMoneyCompact, parseMoneyInput } from "@/core/format/money";
import { useAccountsQuery } from "@/shared/queries/use-accounts";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

import { useCreateCreditCard, useUpdateCreditCard } from "../hooks/use-credit-card-mutations";
import { creditCardFormSchema, type CreditCardFormInput } from "../schemas/credit-card-form.schema";

interface CreditCardFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CreditCard;
}

export function CreditCardFormSheet({ open, onOpenChange, card }: CreditCardFormSheetProps) {
  const { data: accounts = [] } = useAccountsQuery();
  const createCreditCard = useCreateCreditCard();
  const updateCreditCard = useUpdateCreditCard();
  const cardId = card?.id;
  const cardAccountId = card?.accountId;
  const cardName = card?.name;
  const cardLimitCents = card?.limitCents;
  const cardClosingDay = card?.closingDay;
  const cardDueDay = card?.dueDay;
  const defaultAccountId = accounts[0]?.id ?? "";
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
    if (!open) return;

    if (cardId) {
      reset({
        accountId: cardAccountId ?? "",
        name: cardName ?? "",
        limit: formatMoneyCompact(cardLimitCents ?? 0),
        closingDay: cardClosingDay ?? 1,
        dueDay: cardDueDay ?? 10,
      });
      return;
    }

    reset({ accountId: defaultAccountId, name: "", limit: "", closingDay: 1, dueDay: 10 });
  }, [
    open,
    cardId,
    cardAccountId,
    cardName,
    cardLimitCents,
    cardClosingDay,
    cardDueDay,
    defaultAccountId,
    reset,
  ]);

  async function submit(values: CreditCardFormInput) {
    const input = {
      accountId: values.accountId,
      name: values.name,
      limitCents: parseMoneyInput(values.limit),
      closingDay: values.closingDay,
      dueDay: values.dueDay,
    };

    try {
      if (card) {
        await updateCreditCard.mutateAsync({ id: card.id, input });
      } else {
        await createCreditCard.mutateAsync(input);
      }
      onOpenChange(false);
    } catch {
      // The mutation hook shows the error toast; keep the sheet open for correction.
    }
  }

  const pending = isSubmitting || createCreditCard.isPending || updateCreditCard.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{card ? "Editar cartão" : "Novo cartão"}</SheetTitle>
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
          <Button form="credit-card-form" type="submit" disabled={pending}>
            {card ? "Salvar alterações" : "Salvar cartão"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
