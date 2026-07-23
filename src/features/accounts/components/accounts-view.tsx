"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { formatMoney } from "@/core/format/money";
import { EmptyState } from "@/shared/components/empty-state";
import { useAccountsQuery } from "@/shared/queries/use-accounts";
import { useCreditCardsQuery } from "@/shared/queries/use-credit-cards";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

import { AccountFormSheet } from "./account-form-sheet";
import { CreditCardFormSheet } from "./credit-card-form-sheet";
import { CreditCardItem } from "./credit-card-item";

const KIND_LABELS: Record<string, string> = {
  CHECKING: "Conta corrente",
  CASH: "Dinheiro",
  SAVINGS: "Poupança",
  INVESTMENT: "Investimento",
};

export function AccountsView() {
  const { data: accounts = [], isLoading: loadingAccounts } = useAccountsQuery();
  const { data: creditCards = [], isLoading: loadingCards } = useCreditCardsQuery();
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [cardSheetOpen, setCardSheetOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-title font-semibold text-bone">Contas</h2>
          <Button size="sm" onClick={() => setAccountSheetOpen(true)}>
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
              <Card key={account.id}>
                <Card.Body className="flex flex-col gap-1 p-5">
                  <span className="text-body font-medium text-bone">{account.name}</span>
                  <span className="text-micro text-bone-800">{KIND_LABELS[account.kind] ?? account.kind}</span>
                  <span className="tabular font-mono text-small text-bone-600">
                    Saldo inicial {formatMoney(account.openingBalanceCents)}
                  </span>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-title font-semibold text-bone">Cartões de crédito</h2>
          <Button size="sm" onClick={() => setCardSheetOpen(true)}>
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
              <CreditCardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>

      <AccountFormSheet open={accountSheetOpen} onOpenChange={setAccountSheetOpen} />
      <CreditCardFormSheet open={cardSheetOpen} onOpenChange={setCardSheetOpen} />
    </div>
  );
}
