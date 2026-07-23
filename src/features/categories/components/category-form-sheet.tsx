"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { Category } from "@/core/api/types";
import { formatMoneyCompact, parseMoneyInput } from "@/core/format/money";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select } from "@/shared/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

import { useCreateCategory, useUpdateCategory } from "../hooks/use-category-mutations";
import { CategoryIcon, ICON_OPTIONS } from "../lib/icon-map";
import { categoryFormSchema, type CategoryFormInput } from "../schemas/category-form.schema";

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  defaultType: "INCOME" | "EXPENSE";
}

const PALETTE = ["#FF6A00", "#FF8A2B", "#2FBF71", "#E5484D", "#A1A1AA", "#52525B", "#FFFFFF"];

export function CategoryFormSheet({ open, onOpenChange, category, defaultType }: CategoryFormSheetProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", icon: "ellipsis", color: "#FF6A00", type: defaultType, monthlyBudget: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (category) {
      reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        monthlyBudget: category.monthlyBudgetCents ? formatMoneyCompact(category.monthlyBudgetCents) : "",
      });
    } else {
      reset({ name: "", icon: "ellipsis", color: "#FF6A00", type: defaultType, monthlyBudget: "" });
    }
  }, [open, category, defaultType, reset]);

  const icon = watch("icon");
  const color = watch("color");

  async function submit(values: CategoryFormInput) {
    const monthlyBudgetCents = values.monthlyBudget ? parseMoneyInput(values.monthlyBudget) : undefined;
    if (category) {
      await updateCategory.mutateAsync({
        id: category.id,
        input: { name: values.name, icon: values.icon, color: values.color, monthlyBudgetCents },
      });
    } else {
      await createCategory.mutateAsync({
        name: values.name,
        icon: values.icon,
        color: values.color,
        type: values.type,
        monthlyBudgetCents,
      });
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{category ? "Editar categoria" : "Nova categoria"}</SheetTitle>
        </SheetHeader>

        <form id="category-form" onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4" noValidate>
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}22` }}
            >
              <CategoryIcon name={icon} className="size-5" style={{ color }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
            </div>
          </div>
          {errors.name && <p className="text-small text-ember">{errors.name.message}</p>}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="icon">Ícone</Label>
            <Select id="icon" {...register("icon")}>
              {ICON_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("color", option, { shouldValidate: true })}
                  className="size-7 rounded-full ring-offset-2 ring-offset-ink-900 transition-shadow"
                  style={{ backgroundColor: option, boxShadow: color === option ? "0 0 0 2px #FF6A00" : undefined }}
                  aria-label={`Cor ${option}`}
                />
              ))}
            </div>
          </div>

          {!category && (
            <div className="flex rounded-lg border border-ink-800 p-0.5">
              {(["EXPENSE", "INCOME"] as const).map((option) => (
                <label
                  key={option}
                  className="flex-1 cursor-pointer rounded-md py-1.5 text-center text-small has-checked:bg-ink-800 has-checked:text-bone text-bone-600"
                >
                  <input type="radio" value={option} className="sr-only" {...register("type")} />
                  {option === "EXPENSE" ? "Saída" : "Entrada"}
                </label>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="monthlyBudget">Orçamento mensal (opcional)</Label>
            <Input id="monthlyBudget" inputMode="decimal" placeholder="0,00" {...register("monthlyBudget")} />
          </div>
        </form>

        <SheetFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button form="category-form" type="submit" disabled={isSubmitting}>
            Salvar categoria
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
