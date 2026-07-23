"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import type { Transaction } from "@/core/api/types";

type EditableTransactionType = "INCOME" | "EXPENSE";
import { formatDateTimeLocal, nowISO, toSPOffsetISOString } from "@/core/format/date";
import { parseMoneyInput, formatMoneyCompact } from "@/core/format/money";
import { useAccountsQuery } from "@/shared/queries/use-accounts";
import { useCategoriesQuery } from "@/shared/queries/use-categories";
import { useCreditCardsQuery } from "@/shared/queries/use-credit-cards";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { Textarea } from "@/shared/ui/textarea";

import { useCreateTransaction, useUpdateTransaction } from "../hooks/use-transaction-mutations";
import { transactionFormSchema, type TransactionFormInput } from "../schemas/transaction-form.schema";
import { EditScopeDialog } from "./edit-scope-dialog";

interface TransactionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  defaultType?: EditableTransactionType;
}

export function TransactionFormSheet({
  open,
  onOpenChange,
  transaction,
  defaultType = "EXPENSE",
}: TransactionFormSheetProps) {
  const { data: categories = [] } = useCategoriesQuery();
  const { data: accounts = [] } = useAccountsQuery();
  const { data: creditCards = [] } = useCreditCardsQuery();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const [pendingValues, setPendingValues] = useState<TransactionFormInput | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: defaultType,
      amount: "",
      occurredAt: formatDateTimeLocal(nowISO()),
      paymentMethod: "PIX",
      installmentTotal: 1,
      accountId: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (transaction) {
      reset({
        type: transaction.type === "INCOME" ? "INCOME" : "EXPENSE",
        amount: formatMoneyCompact(transaction.amountCents),
        description: transaction.description,
        occurredAt: formatDateTimeLocal(transaction.occurredAt),
        categoryId: transaction.categoryId ?? undefined,
        accountId: transaction.accountId,
        creditCardId: transaction.creditCardId ?? undefined,
        paymentMethod: transaction.paymentMethod,
        installmentTotal: 1,
        notes: transaction.notes ?? undefined,
      });
    } else {
      reset({
        type: defaultType,
        amount: "",
        occurredAt: formatDateTimeLocal(nowISO()),
        paymentMethod: "PIX",
        installmentTotal: 1,
        accountId: accounts[0]?.id ?? "",
      });
    }
  }, [open, transaction, defaultType, accounts, reset]);

  const type = watch("type");
  const paymentMethod = watch("paymentMethod");
  const filteredCategories = categories.filter((category) => category.type === type && !category.isArchived);

  async function submit(values: TransactionFormInput) {
    if (transaction?.installmentGroupId) {
      setPendingValues(values);
      return;
    }
    await persist(values);
  }

  async function persist(values: TransactionFormInput, scope: "one" | "future" | "all" = "one") {
    const amountCents = parseMoneyInput(values.amount);
    if (transaction) {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        scope,
        input: {
          amountCents,
          description: values.description,
          occurredAt: toSPOffsetISOString(values.occurredAt),
          categoryId: values.categoryId ?? null,
          accountId: values.accountId,
          creditCardId: values.creditCardId ?? null,
          paymentMethod: values.paymentMethod,
          notes: values.notes ?? null,
        },
      });
    } else {
      await createTransaction.mutateAsync({
        type: values.type,
        amountCents,
        description: values.description,
        occurredAt: toSPOffsetISOString(values.occurredAt),
        categoryId: values.categoryId,
        accountId: values.accountId,
        creditCardId: values.paymentMethod === "CREDIT" ? values.creditCardId : undefined,
        paymentMethod: values.paymentMethod,
        installmentTotal: values.installmentTotal,
        notes: values.notes,
      });
    }
    onOpenChange(false);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{transaction ? "Editar lançamento" : "Novo lançamento"}</SheetTitle>
          </SheetHeader>

          <form
            id="transaction-form"
            onSubmit={handleSubmit(submit)}
            className="flex flex-1 flex-col gap-4"
            noValidate
          >
            {!transaction && (
              <div className="flex rounded-lg border border-ink-800 p-0.5">
                {(["EXPENSE", "INCOME"] as const).map((option) => (
                  <label
                    key={option}
                    className="flex-1 cursor-pointer rounded-md py-1.5 text-center text-small has-checked:bg-ink-800 has-checked:text-bone text-bone-600"
                  >
                    <input type="radio" value={option} className="sr-only" {...register("type")} />
                    {option === "EXPENSE" ? "Saída" : "Entrada"}
                  </label>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Valor</Label>
              <Input id="amount" inputMode="decimal" placeholder="0,00" {...register("amount")} />
              {errors.amount && <p className="text-small text-ember">{errors.amount.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" {...register("description")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occurredAt">Data</Label>
              <Input id="occurredAt" type="datetime-local" {...register("occurredAt")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="categoryId">Categoria</Label>
              <Select id="categoryId" {...register("categoryId")}>
                <option value="">Selecione</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              {errors.categoryId && <p className="text-small text-ember">{errors.categoryId.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="accountId">Conta</Label>
              <Select id="accountId" {...register("accountId")}>
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
              <Label htmlFor="paymentMethod">Método</Label>
              <Select id="paymentMethod" {...register("paymentMethod")}>
                <option value="PIX">Pix</option>
                <option value="DEBIT">Débito</option>
                <option value="CREDIT">Crédito</option>
                <option value="CASH">Dinheiro</option>
              </Select>
            </div>

            {paymentMethod === "CREDIT" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="creditCardId">Cartão</Label>
                <Select id="creditCardId" {...register("creditCardId")}>
                  <option value="">Selecione</option>
                  {creditCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name}
                    </option>
                  ))}
                </Select>
                {errors.creditCardId && <p className="text-small text-ember">{errors.creditCardId.message}</p>}
              </div>
            )}

            {!transaction && paymentMethod === "CREDIT" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="installmentTotal">Parcelas</Label>
                <Controller
                  control={control}
                  name="installmentTotal"
                  render={({ field }) => (
                    <Input
                      id="installmentTotal"
                      type="number"
                      min={1}
                      max={24}
                      value={field.value}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  )}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" {...register("notes")} />
            </div>
          </form>

          <SheetFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)} type="button">
              Cancelar
            </Button>
            <Button form="transaction-form" type="submit" disabled={isSubmitting}>
              {transaction ? "Salvar alterações" : "Salvar gasto"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <EditScopeDialog
        open={pendingValues !== null}
        onOpenChange={(value) => !value && setPendingValues(null)}
        onConfirm={(scope) => {
          if (pendingValues) void persist(pendingValues, scope);
          setPendingValues(null);
        }}
      />
    </>
  );
}
