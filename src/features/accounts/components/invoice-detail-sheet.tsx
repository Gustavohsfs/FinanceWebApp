"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { CreditCard, Transaction } from "@/core/api/types";
import { dayLabel, monthLabel, monthRangeUTC } from "@/core/format/date";
import { formatMoney } from "@/core/format/money";
import { EditScopeDialog } from "@/features/transactions/components/edit-scope-dialog";
import { TransactionFormSheet } from "@/features/transactions/components/transaction-form-sheet";
import { useDeleteTransaction } from "@/features/transactions/hooks/use-transaction-mutations";
import { useTransactionsInfiniteQuery } from "@/features/transactions/hooks/use-transactions-query";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { MoneyText } from "@/shared/components/money-text";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Skeleton } from "@/shared/ui/skeleton";

import { useInvoiceQuery } from "../hooks/use-credit-card-mutations";

interface InvoiceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CreditCard;
  month: string;
}

export function InvoiceDetailSheet({
  open,
  onOpenChange,
  card,
  month,
}: InvoiceDetailSheetProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction>();
  const [transactionSheetOpen, setTransactionSheetOpen] = useState(false);
  const [deleteScopeTarget, setDeleteScopeTarget] = useState<Transaction>();
  const range = useMemo(() => monthRangeUTC(month), [month]);
  const queriesEnabled = open && Boolean(card);
  const invoiceQuery = useInvoiceQuery(card?.id ?? "", month, queriesEnabled);
  const transactionsQuery = useTransactionsInfiniteQuery(
    {
      creditCardId: card?.id,
      type: "EXPENSE",
      basis: "cash",
      from: range.from,
      to: range.to,
      limit: 50,
    },
    queriesEnabled,
  );
  const deleteTransaction = useDeleteTransaction();
  const transactions =
    transactionsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const isLoading = invoiceQuery.isLoading || transactionsQuery.isLoading;
  const isError = invoiceQuery.isError || transactionsQuery.isError;

  function retryQueries() {
    void invoiceQuery.refetch();
    void transactionsQuery.refetch();
  }

  function editTransaction(transaction: Transaction) {
    setEditingTransaction(transaction);
    setTransactionSheetOpen(true);
  }

  function requestDelete(transaction: Transaction) {
    if (transaction.installmentGroupId) {
      setDeleteScopeTarget(transaction);
      return;
    }

    deleteTransaction.mutate({ id: transaction.id });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="max-w-2xl">
          {isLoading ? (
            <InvoiceLoadingState />
          ) : isError ? (
            <>
              <SheetHeader>
                <SheetTitle>Detalhes da fatura</SheetTitle>
                <SheetDescription>
                  Consulte as compras que compõem o total do cartão.
                </SheetDescription>
              </SheetHeader>
              <ErrorState onRetry={retryQueries} />
            </>
          ) : (
            <>
              <SheetHeader className="gap-3 border-b border-ink-800 pb-5">
                <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                  <div className="min-w-0">
                    <SheetTitle className="truncate">{card?.name ?? "Fatura"}</SheetTitle>
                    <SheetDescription className="capitalize">
                      {monthLabel(month)}
                    </SheetDescription>
                  </div>
                  {invoiceQuery.data && (
                    <Badge
                      variant={invoiceQuery.data.status === "OPEN" ? "flame" : "neutral"}
                    >
                      {invoiceQuery.data.status === "OPEN" ? "Aberta" : "Fechada"}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-micro uppercase tracking-wide text-bone-800">
                    Total da fatura
                  </span>
                  <span className="tabular font-mono text-title text-bone">
                    {formatMoney(invoiceQuery.data?.totalCents ?? 0)}
                  </span>
                </div>
              </SheetHeader>

              {transactions.length === 0 ? (
                <EmptyState
                  className="my-auto"
                  title="Nenhuma compra nesta fatura."
                  description="As compras compensadas neste mês aparecerão aqui."
                />
              ) : (
                <div className="flex flex-1 flex-col gap-4">
                  <ul className="divide-y divide-ink-800">
                    {transactions.map((transaction) => (
                      <li
                        key={transaction.id}
                        className="flex items-center justify-between gap-3 py-4"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="truncate text-body font-medium text-bone">
                              {transaction.description || "Compra sem descrição"}
                            </span>
                            {transaction.isProjected && (
                              <Badge variant="projected">projetado</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-micro text-bone-600">
                            <span className="tabular font-mono">
                              {dayLabel(transaction.settledAt ?? transaction.occurredAt)}
                            </span>
                            <span>{installmentLabel(transaction)}</span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <MoneyText
                            cents={transaction.amountCents}
                            projected={transaction.isProjected}
                            className="text-small text-bone sm:text-body"
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Ações da compra ${transaction.description || "sem descrição"}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => editTransaction(transaction)}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-ember"
                                disabled={deleteTransaction.isPending}
                                onSelect={() => requestDelete(transaction)}
                              >
                                <Trash2 className="size-3.5" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {transactionsQuery.hasNextPage && (
                    <Button
                      variant="outline"
                      className="self-center"
                      disabled={transactionsQuery.isFetchingNextPage}
                      onClick={() => void transactionsQuery.fetchNextPage()}
                    >
                      {transactionsQuery.isFetchingNextPage
                        ? "Carregando…"
                        : "Carregar mais"}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      <TransactionFormSheet
        open={transactionSheetOpen}
        onOpenChange={(nextOpen) => {
          setTransactionSheetOpen(nextOpen);
          if (!nextOpen) setEditingTransaction(undefined);
        }}
        transaction={editingTransaction}
        defaultType="EXPENSE"
      />

      <EditScopeDialog
        open={Boolean(deleteScopeTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleteScopeTarget(undefined);
        }}
        onConfirm={(scope) => {
          if (deleteScopeTarget) {
            deleteTransaction.mutate({
              id: deleteScopeTarget.id,
              scope,
            });
          }
          setDeleteScopeTarget(undefined);
        }}
      />
    </>
  );
}

function InvoiceLoadingState() {
  return (
    <div className="flex flex-col gap-5" aria-label="Carregando fatura">
      <SheetHeader className="gap-3 border-b border-ink-800 pb-5">
        <SheetTitle className="sr-only">Carregando fatura</SheetTitle>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-36" />
      </SheetHeader>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function installmentLabel(transaction: Transaction): string {
  if (
    !transaction.installmentTotal ||
    transaction.installmentTotal <= 1 ||
    !transaction.installmentNumber
  ) {
    return "À vista";
  }

  return `Parcela ${transaction.installmentNumber}/${transaction.installmentTotal}`;
}
