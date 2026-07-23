"use client";

import { MoreHorizontal } from "lucide-react";

import type { Goal } from "@/core/api/types";
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

import { useGoalProgressQuery } from "../hooks/use-goals";

const KIND_LABELS: Record<Goal["kind"], string> = {
  SAVING: "Guardar",
  INVESTMENT: "Investir",
  SPEND_LIMIT: "Limite de gasto",
};

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { data: progress, isLoading } = useGoalProgressQuery(goal.id, "accrual");
  const ratio = progress ? Math.min(1, progress.ratio) : 0;

  return (
    <Card>
      <Card.Header className="flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <Card.Title>{goal.name}</Card.Title>
          <Badge variant="neutral">{KIND_LABELS[goal.kind]}</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Ações da meta">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(goal)}>Editar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card.Header>
      <Card.Body className="flex flex-col gap-3">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
                <div
                  className={`h-full rounded-full ${progress?.isOver ? "bg-ember" : "bg-flame-500"}`}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-small">
                <span className="tabular font-mono text-bone">
                  {formatMoney(progress?.effectuatedCents ?? 0)}
                </span>
                <span className="tabular font-mono text-bone-600">
                  de {formatMoney(progress?.plannedCents ?? goal.targetCents)}
                </span>
              </div>
            </div>
            {progress && <p className="text-small text-bone-600">{progress.projectionLabel}</p>}
          </>
        )}
      </Card.Body>
    </Card>
  );
}
