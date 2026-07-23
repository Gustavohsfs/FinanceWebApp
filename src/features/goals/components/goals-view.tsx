"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import type { Goal } from "@/core/api/types";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import { useGoalsQuery } from "../hooks/use-goals";
import { GoalCard } from "./goal-card";
import { GoalFormSheet } from "./goal-form-sheet";

export function GoalsView() {
  const { data: goals = [], isLoading, isError, refetch } = useGoalsQuery();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | undefined>(undefined);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setEditing(undefined);
            setSheetOpen(true);
          }}
        >
          <Plus className="size-4" /> Nova meta
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          title="Nenhuma meta criada."
          description="Crie uma meta de guardar, investir ou limite de gasto para acompanhar seu progresso."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(value) => {
                setEditing(value);
                setSheetOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <GoalFormSheet open={sheetOpen} onOpenChange={setSheetOpen} goal={editing} />
    </div>
  );
}
