"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import type { Account, CreditCard } from "@/core/api/types";
import { currentMonthKey } from "@/core/format/date";
import { EmptyState } from "@/shared/components/empty-state";
import { useAccountsQuery } from "@/shared/queries/use-accounts";
import { useCreditCardsQuery } from "@/shared/queries/use-credit-cards";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import { AccountItem } from "./account-item";
import { AccountFormSheet } from "./account-form-sheet";
import { CreditCardFormSheet } from "./credit-card-form-sheet";
import { CreditCardItem } from "./credit-card-item";
import { InvoiceDetailSheet } from "./invoice-detail-sheet";
import { ResourceDeleteDialog } from "./resource-delete-dialog";
import { useDeleteAccount } from "../hooks/use-account-mutations";
import { useDeleteCreditCard } from "../hooks/use-credit-card-mutations";

export function AccountsView() {
  const { data: accounts = [], isLoading: loadingAccounts } = useAccountsQuery();
  const { data: creditCards = [], isLoading: loadingCards } = useCreditCardsQuery();
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [cardSheetOpen, setCardSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account>();
  const [editingCard, setEditingCard] = useState<CreditCard>();
  const [invoiceSelection, setInvoiceSelection] = useState<{
    card: CreditCard;
    month: string;
  }>();
  const [invoiceSheetOpen, setInvoiceSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<
    { kind: "account"; value: Account } | { kind: "card"; value: CreditCard }
  >();
  const deleteAccount = useDeleteAccount();
  const deleteCreditCard = useDeleteCreditCard();
  const deletionPending = deleteAccount.isPending || deleteCreditCard.isPending;

  function openAccountCreateSheet() {
    setEditingAccount(undefined);
    setAccountSheetOpen(true);
  }

  function openCardCreateSheet() {
    setEditingCard(undefined);
    setCardSheetOpen(true);
  }

  async function confirmDeletion() {
    if (!deleting) return;

    try {
      if (deleting.kind === "account") {
        await deleteAccount.mutateAsync(deleting.value.id);
      } else {
        await deleteCreditCard.mutateAsync(deleting.value.id);
      }
      setDeleting(undefined);
    } catch {
      // The mutation hook shows the mapped error toast and keeps this dialog open.
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-title font-semibold text-bone">Contas</h2>
          <Button size="sm" onClick={openAccountCreateSheet}>
            <Plus className="size-3.5" /> Nova conta
          </Button>
        </div>
        {loadingAccounts ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState title="Nenhuma conta cadastrada." description="Crie a primeira conta para registrar lançamentos." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountItem
                key={account.id}
                account={account}
                onEdit={(account) => {
                  setEditingAccount(account);
                  setAccountSheetOpen(true);
                }}
                onDelete={(account) => setDeleting({ kind: "account", value: account })}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-title font-semibold text-bone">Cartões de crédito</h2>
          <Button size="sm" onClick={openCardCreateSheet}>
            <Plus className="size-3.5" /> Novo cartão
          </Button>
        </div>
        {loadingCards ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        ) : creditCards.length === 0 ? (
          <EmptyState title="Nenhum cartão cadastrado." description="Cartões de crédito permitem parcelamento nos lançamentos." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creditCards.map((card) => (
              <CreditCardItem
                key={card.id}
                card={card}
                onEdit={(card) => {
                  setEditingCard(card);
                  setCardSheetOpen(true);
                }}
                onDelete={(card) => setDeleting({ kind: "card", value: card })}
                onOpenInvoice={(card) => {
                  setInvoiceSelection({ card, month: currentMonthKey() });
                  setInvoiceSheetOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <AccountFormSheet
        open={accountSheetOpen}
        account={editingAccount}
        onOpenChange={(open) => {
          setAccountSheetOpen(open);
          if (!open) setEditingAccount(undefined);
        }}
      />
      <CreditCardFormSheet
        open={cardSheetOpen}
        card={editingCard}
        onOpenChange={(open) => {
          setCardSheetOpen(open);
          if (!open) setEditingCard(undefined);
        }}
      />
      <InvoiceDetailSheet
        open={invoiceSheetOpen}
        onOpenChange={setInvoiceSheetOpen}
        card={invoiceSelection?.card}
        month={invoiceSelection?.month ?? currentMonthKey()}
      />
      <ResourceDeleteDialog
        open={Boolean(deleting)}
        title={deleting?.kind === "account" ? "Excluir conta?" : "Excluir cartão?"}
        description={
          deleting
            ? `Excluir ${deleting.kind === "account" ? "a conta" : "o cartão"} “${deleting.value.name}”? Os lançamentos históricos permanecem preservados.`
            : ""
        }
        pending={deletionPending}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined);
        }}
        onConfirm={() => void confirmDeletion()}
      />
    </div>
  );
}
