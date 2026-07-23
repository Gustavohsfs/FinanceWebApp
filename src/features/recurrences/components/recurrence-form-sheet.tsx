"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { formatDateTimeLocal, nowISO, toSPOffsetISOString } from "@/core/format/date";
import { parseMoneyInput } from "@/core/format/money";
import { useAccountsQuery } from "@/shared/queries/use-accounts";
import { useCategoriesQuery } from "@/shared/queries/use-categories";
import { useCreditCardsQuery } from "@/shared/queries/use-credit-cards";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

import { useCreateRecurrence } from "../hooks/use-recurrences";
import { recurrenceFormSchema, type RecurrenceFormInput } from "../schemas/recurrence-form.schema";

interface RecurrenceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "INCOME" | "EXPENSE";
}

export function RecurrenceFormSheet({ open, onOpenChange, type }: RecurrenceFormSheetProps) {
  const { data: categories = [] } = useCategoriesQuery({ type });
  const { data: accounts = [] } = useAccountsQuery();
  const { data: creditCards = [] } = useCreditCardsQuery();
  const createRecurrence = useCreateRecurrence();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecurrenceFormInput>({
    resolver: zodResolver(recurrenceFormSchema),
    defaultValues: {
      type,
      amount: "",
      description: "",
      paymentMethod: "PIX",
      dayOfMonth: 5,
      nextOccurrenceAt: formatDateTimeLocal(nowISO()),
      accountId: "",
    },
  });

  useEffect(() => {
    if (open) reset({ type, amount: "", description: "", paymentMethod: "PIX", dayOfMonth: 5, nextOccurrenceAt: formatDateTimeLocal(nowISO()), accountId: accounts[0]?.id ?? "" });
  }, [open, type, accounts, reset]);

  const paymentMethod = watch("paymentMethod");

  async function submit(values: RecurrenceFormInput) {
    await createRecurrence.mutateAsync({
      type: values.type,
      amountCents: parseMoneyInput(values.amount),
      description: values.description,
      categoryId: values.categoryId,
      accountId: values.accountId,
      creditCardId: values.paymentMethod === "CREDIT" ? values.creditCardId : undefined,
      paymentMethod: values.paymentMethod,
      dayOfMonth: values.dayOfMonth,
      nextOccurrenceAt: toSPOffsetISOString(values.nextOccurrenceAt),
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{type === "INCOME" ? "Nova entrada recorrente" : "Nova saída recorrente"}</SheetTitle>
        </SheetHeader>

        <form id="recurrence-form" onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-amount">Valor</Label>
            <Input id="r-amount" inputMode="decimal" placeholder="0,00" {...register("amount")} />
            {errors.amount && <p className="text-small text-ember">{errors.amount.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-description">Descrição</Label>
            <Input id="r-description" {...register("description")} />
            {errors.description && <p className="text-small text-ember">{errors.description.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-categoryId">Categoria</Label>
            <Select id="r-categoryId" {...register("categoryId")}>
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-accountId">Conta</Label>
            <Select id="r-accountId" {...register("accountId")}>
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
            <Label htmlFor="r-paymentMethod">Método</Label>
            <Select id="r-paymentMethod" {...register("paymentMethod")}>
              <option value="PIX">Pix</option>
              <option value="DEBIT">Débito</option>
              <option value="CREDIT">Crédito</option>
              <option value="CASH">Dinheiro</option>
            </Select>
          </div>

          {paymentMethod === "CREDIT" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-creditCardId">Cartão</Label>
              <Select id="r-creditCardId" {...register("creditCardId")}>
                <option value="">Selecione</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-dayOfMonth">Dia do mês</Label>
            <Input id="r-dayOfMonth" type="number" min={1} max={31} {...register("dayOfMonth")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-nextOccurrenceAt">Próxima ocorrência</Label>
            <Input id="r-nextOccurrenceAt" type="datetime-local" {...register("nextOccurrenceAt")} />
          </div>
        </form>

        <SheetFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button form="recurrence-form" type="submit" disabled={isSubmitting}>
            Salvar recorrência
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
