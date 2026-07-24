"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";

import type { Account } from "@/core/api/types";
import { formatMoney } from "@/core/format/money";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

const KIND_LABELS: Record<Account["kind"], string> = {
  CHECKING: "Conta corrente",
  CASH: "Dinheiro",
  SAVINGS: "Poupança",
  INVESTMENT: "Investimento",
};

interface AccountItemProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountItem({ account, onEdit, onDelete }: AccountItemProps) {
  return (
    <Card>
      <Card.Body className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-body font-medium text-bone">{account.name}</span>
            <span className="text-micro text-bone-800">{KIND_LABELS[account.kind]}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Ações da conta ${account.name}`}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
              <DropdownMenuItem onSelect={() => onEdit(account)}>Editar</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(account)} className="text-ember">
                <Trash2 className="size-3.5" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <span className="tabular font-mono text-small text-bone-600">
          Saldo inicial {formatMoney(account.openingBalanceCents)}
        </span>
      </Card.Body>
    </Card>
  );
}
