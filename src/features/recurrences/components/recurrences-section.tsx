"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { dayLabel } from "@/core/format/date";
import { formatMoney } from "@/core/format/money";
import { EmptyState } from "@/shared/components/empty-state";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

import { useConfirmRecurrence, useRecurrencesQuery } from "../hooks/use-recurrences";
import { RecurrenceFormSheet } from "./recurrence-form-sheet";

interface RecurrencesSectionProps {
  type: "INCOME" | "EXPENSE";
}

export function RecurrencesSection({ type }: RecurrencesSectionProps) {
  const { data, isLoading } = useRecurrencesQuery();
  const confirmRecurrence = useConfirmRecurrence();
  const [sheetOpen, setSheetOpen] = useState(false);

  const recurrences = (data ?? []).filter((recurrence) => recurrence.type === type);

  return (
    <Card>
      <Card.Header className="flex-row items-center justify-between">
        <Card.Title>Recorrentes</Card.Title>
        <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
          <Plus className="size-3.5" /> Nova recorrência
        </Button>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : recurrences.length === 0 ? (
          <EmptyState
            title="Nenhuma recorrência cadastrada."
            description="Recorrências previstas aparecem aqui e podem ser confirmadas em um clique."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-ink-800">
            {recurrences.map((recurrence) => (
              <li key={recurrence.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-small text-bone">{recurrence.description}</span>
                  <span className="text-micro text-bone-800">
                    Todo dia {recurrence.dayOfMonth} · próxima em {dayLabel(recurrence.nextOccurrenceAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular font-mono text-small text-bone">
                    {formatMoney(recurrence.amountCents)}
                  </span>
                  {recurrence.isActive ? (
                    <Button size="sm" variant="outline" onClick={() => confirmRecurrence.mutate(recurrence.id)}>
                      Confirmar
                    </Button>
                  ) : (
                    <Badge variant="neutral">inativa</Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>

      <RecurrenceFormSheet open={sheetOpen} onOpenChange={setSheetOpen} type={type} />
    </Card>
  );
}
