"use client";

import type { AggregationBasis } from "@/core/api/types";
import { cn } from "@/shared/lib/cn";

interface BasisToggleProps {
  basis: AggregationBasis;
  onChange: (basis: AggregationBasis) => void;
}

const OPTIONS: { value: AggregationBasis; label: string }[] = [
  { value: "accrual", label: "Competência" },
  { value: "cash", label: "Caixa" },
];

export function BasisToggle({ basis, onChange }: BasisToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-ink-800 bg-ink-900 p-0.5 text-small">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1 transition-colors",
            basis === option.value ? "bg-ink-800 text-bone" : "text-bone-600 hover:text-bone",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
