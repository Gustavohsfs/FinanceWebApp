"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { addMonthsToKey, monthLabel } from "@/core/format/date";
import { Button } from "@/shared/ui/button";

interface PeriodPickerProps {
  monthKey: string;
  onChange: (nextMonthKey: string) => void;
}

export function PeriodPicker({ monthKey, onChange }: PeriodPickerProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Mês anterior"
        onClick={() => onChange(addMonthsToKey(monthKey, -1))}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-32 text-center text-body font-medium capitalize text-bone">
        {monthLabel(monthKey)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Próximo mês"
        onClick={() => onChange(addMonthsToKey(monthKey, 1))}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
