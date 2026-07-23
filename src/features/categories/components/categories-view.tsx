"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import type { Category, CategoryType } from "@/core/api/types";
import { currentMonthKey } from "@/core/format/date";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { useBudgetStatusQuery } from "@/shared/queries/use-budget-status";
import { useCategoriesQuery } from "@/shared/queries/use-categories";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Skeleton } from "@/shared/ui/skeleton";

import { CategoryCard } from "./category-card";
import { CategoryFormSheet } from "./category-form-sheet";

export function CategoriesView() {
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);

  const { data: categories = [], isLoading, isError, refetch } = useCategoriesQuery({ type, includeArchived });
  const { data: budgetStatus = [] } = useBudgetStatusQuery(currentMonthKey(), "accrual");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-ink-800 p-0.5">
          {(["EXPENSE", "INCOME"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={`rounded-md px-4 py-1.5 text-small transition-colors ${
                type === option ? "bg-ink-800 text-bone" : "text-bone-600 hover:text-bone"
              }`}
            >
              {option === "EXPENSE" ? "Saídas" : "Entradas"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-small text-bone-600">
            <Checkbox checked={includeArchived} onCheckedChange={(value) => setIncludeArchived(!!value)} />
            Mostrar arquivadas
          </label>
          <Button
            onClick={() => {
              setEditing(undefined);
              setSheetOpen(true);
            }}
          >
            <Plus className="size-4" /> Nova categoria
          </Button>
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria por aqui."
          description="Crie a primeira categoria para começar a organizar seus lançamentos."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              budget={budgetStatus.find((status) => status.categoryId === category.id)}
              onEdit={(value) => {
                setEditing(value);
                setSheetOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <CategoryFormSheet open={sheetOpen} onOpenChange={setSheetOpen} category={editing} defaultType={type} />
    </div>
  );
}
