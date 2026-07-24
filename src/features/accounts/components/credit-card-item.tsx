"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";

import type { CreditCard } from "@/core/api/types";
import { currentMonthKey } from "@/core/format/date";
import { formatMoney } from "@/core/format/money";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";

import { useInvoiceQuery } from "../hooks/use-credit-card-mutations";

interface CreditCardItemProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
  onDelete: (card: CreditCard) => void;
  onOpenInvoice: (card: CreditCard) => void;
}

export function CreditCardItem({ card, onEdit, onDelete, onOpenInvoice }: CreditCardItemProps) {
  const { data: invoice, isLoading } = useInvoiceQuery(card.id, currentMonthKey());

  return (
    <Card>
      <Card.Body className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-body font-medium text-bone">{card.name}</span>
            <span className="text-micro text-bone-800">
              Fecha dia {card.closingDay} · vence dia {card.dueDay}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {isLoading ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              invoice && (
                <Badge variant={invoice.status === "OPEN" ? "flame" : "neutral"}>
                  {invoice.status === "OPEN" ? "Aberta" : "Fechada"}
                </Badge>
              )
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Ações do cartão ${card.name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                <DropdownMenuItem onSelect={() => onEdit(card)}>Editar</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDelete(card)} className="text-ember">
                  <Trash2 className="size-3.5" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onOpenInvoice(card)}
        >
          Ver fatura
        </Button>
      </Card.Body>
    </Card>
  );
}
