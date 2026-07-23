"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { Goal } from "@/core/api/types";
import { formatDateInput } from "@/core/format/date";
import { formatMoneyCompact, parseMoneyInput } from "@/core/format/money";
import { useCategoriesQuery } from "@/shared/queries/use-categories";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

import { useCreateGoal, useUpdateGoal } from "../hooks/use-goals";
import { goalFormSchema, type GoalFormInput } from "../schemas/goal-form.schema";

interface GoalFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
}

const KIND_OPTIONS: { value: GoalFormInput["kind"]; label: string }[] = [
  { value: "SAVING", label: "Guardar" },
  { value: "INVESTMENT", label: "Investir" },
  { value: "SPEND_LIMIT", label: "Limite de gasto" },
];

export function GoalFormSheet({ open, onOpenChange, goal }: GoalFormSheetProps) {
  const { data: categories = [] } = useCategoriesQuery({ type: "EXPENSE" });
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormInput>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      kind: "SAVING",
      target: "",
      startDate: formatDateInput(new Date().toISOString()),
      deadline: formatDateInput(new Date().toISOString()),
      recurrence: "ONCE",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (goal) {
      reset({
        name: goal.name,
        kind: goal.kind,
        target: formatMoneyCompact(goal.targetCents),
        categoryId: goal.categoryId ?? undefined,
        startDate: formatDateInput(goal.startDate),
        deadline: formatDateInput(goal.deadline),
        recurrence: goal.recurrence,
      });
    } else {
      reset({
        name: "",
        kind: "SAVING",
        target: "",
        startDate: formatDateInput(new Date().toISOString()),
        deadline: formatDateInput(new Date().toISOString()),
        recurrence: "ONCE",
      });
    }
  }, [open, goal, reset]);

  const kind = watch("kind");

  async function submit(values: GoalFormInput) {
    const input = {
      name: values.name,
      targetCents: parseMoneyInput(values.target),
      categoryId: values.kind === "SPEND_LIMIT" ? values.categoryId : undefined,
      startDate: `${values.startDate}T00:00:00-03:00`,
      deadline: `${values.deadline}T23:59:59-03:00`,
      recurrence: values.recurrence,
    };
    if (goal) {
      await updateGoal.mutateAsync({ id: goal.id, input });
    } else {
      await createGoal.mutateAsync({ ...input, kind: values.kind });
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{goal ? "Editar meta" : "Nova meta"}</SheetTitle>
        </SheetHeader>
        <form id="goal-form" onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-name">Nome</Label>
            <Input id="goal-name" {...register("name")} />
            {errors.name && <p className="text-small text-ember">{errors.name.message}</p>}
          </div>

          {!goal && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-kind">Tipo</Label>
              <Select id="goal-kind" {...register("kind")}>
                {KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-target">Valor alvo</Label>
            <Input id="goal-target" inputMode="decimal" placeholder="0,00" {...register("target")} />
            {errors.target && <p className="text-small text-ember">{errors.target.message}</p>}
          </div>

          {kind === "SPEND_LIMIT" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-category">Categoria</Label>
              <Select id="goal-category" {...register("categoryId")}>
                <option value="">Selecione</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              {errors.categoryId && <p className="text-small text-ember">{errors.categoryId.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-start">Início</Label>
              <Input id="goal-start" type="date" {...register("startDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-deadline">Prazo</Label>
              <Input id="goal-deadline" type="date" {...register("deadline")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-recurrence">Recorrência</Label>
            <Select id="goal-recurrence" {...register("recurrence")}>
              <option value="ONCE">Única</option>
              <option value="MONTHLY">Mensal</option>
            </Select>
          </div>
        </form>
        <SheetFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button form="goal-form" type="submit" disabled={isSubmitting}>
            Salvar meta
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
