"use client";

import { Archive, MoreHorizontal } from "lucide-react";

import type { BudgetStatus, Category } from "@/core/api/types";
import { formatMoney } from "@/core/format/money";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { useArchiveCategory } from "../hooks/use-category-mutations";
import { CategoryIcon } from "../lib/icon-map";

interface CategoryCardProps {
  category: Category;
  budget?: BudgetStatus;
  onEdit: (category: Category) => void;
}

export function CategoryCard({ category, budget, onEdit }: CategoryCardProps) {
  const archiveCategory = useArchiveCategory();
  const ratio = budget ? Math.min(1, budget.ratio) : 0;

  return (
    <Card className={category.isArchived ? "opacity-50" : undefined}>
      <Card.Body className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${category.color}22` }}
            >
              <CategoryIcon name={category.icon} className="size-4" style={{ color: category.color }} />
            </div>
            <div className="flex flex-col">
              <span className="text-small font-medium text-bone">{category.name}</span>
              <span className="text-micro text-bone-800">
                {category.type === "EXPENSE" ? "Saída" : "Entrada"}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ações da categoria">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(category)}>Editar</DropdownMenuItem>
              {!category.isArchived && (
                <DropdownMenuItem onSelect={() => archiveCategory.mutate(category.id)} className="text-ember">
                  <Archive className="size-3.5" /> Arquivar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {category.monthlyBudgetCents ? (
          <div className="flex flex-col gap-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
              <div
                className={`h-full rounded-full ${budget && budget.overCents > 0 ? "bg-ember" : "bg-flame-500"}`}
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            <span className="tabular font-mono text-micro text-bone-600">
              {formatMoney(budget?.spentCents ?? 0)} de {formatMoney(category.monthlyBudgetCents)}
            </span>
          </div>
        ) : (
          <span className="text-micro text-bone-800">Sem orçamento definido</span>
        )}
      </Card.Body>
    </Card>
  );
}
