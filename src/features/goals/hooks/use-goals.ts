"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { proxyFetch } from "@/core/api/client-fetch";
import { ApiRequestError } from "@/core/api/errors";
import type { AggregationBasis, Goal, GoalKind, GoalProgress, GoalRecurrence } from "@/core/api/types";
import { queryKeys } from "@/shared/queries/keys";

export function useGoalsQuery() {
  return useQuery({
    queryKey: queryKeys.goals(),
    queryFn: () => proxyFetch<Goal[]>("/goals"),
  });
}

export function useGoalProgressQuery(goalId: string, basis: AggregationBasis) {
  return useQuery({
    queryKey: queryKeys.goalProgress(goalId, basis),
    queryFn: () => proxyFetch<GoalProgress>(`/goals/${goalId}/progress`, { query: { basis } }),
  });
}

export interface GoalMutationInput {
  name: string;
  kind: GoalKind;
  targetCents: number;
  categoryId?: string;
  startDate: string;
  deadline: string;
  recurrence: GoalRecurrence;
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GoalMutationInput) => proxyFetch<Goal>("/goals", { method: "POST", body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals() });
      toast.success("Meta criada.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível criar a meta.");
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<GoalMutationInput> }) =>
      proxyFetch<Goal>(`/goals/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals() });
      toast.success("Meta atualizada.");
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : "Não foi possível atualizar a meta.");
    },
  });
}
