"use client";

import type { CreditCard } from "@/core/api/types";
import { currentMonthKey } from "@/core/format/date";
import { formatMoney } from "@/core/format/money";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

import { useInvoiceQuery } from "../hooks/use-credit-card-mutations";

export function CreditCardItem({ card }: { card: CreditCard }) {
  const { data: invoice, isLoading } = useInvoiceQuery(card.id, currentMonthKey());

  return (
    <Card>
      <Card.Body className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-body font-medium text-bone">{card.name}</span>
            <span className="text-micro text-bone-800">
              Fecha dia {card.closingDay} · vence dia {card.dueDay}
            </span>
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            invoice && (
              <Badge variant={invoice.status === "OPEN" ? "flame" : "neutral"}>
                {invoice.status === "OPEN" ? "Aberta" : "Fechada"}
              </Badge>
            )
          )}
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-micro text-bone-800">Fatura do mês</span>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <span className="tabular font-mono text-title text-bone">
                {formatMoney(invoice?.totalCents ?? 0)}
              </span>
            )}
          </div>
          <span className="text-micro text-bone-800">Limite {formatMoney(card.limitCents)}</span>
        </div>
      </Card.Body>
    </Card>
  );
}
