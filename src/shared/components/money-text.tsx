import { cn } from "@/shared/lib/cn";
import { formatMoney, formatMoneySigned } from "@/core/format/money";

interface MoneyTextProps {
  cents: number;
  signed?: boolean;
  projected?: boolean;
  className?: string;
}

/** Toda coluna de dinheiro passa por aqui — garante tabular-nums (guardrail §10.7). */
export function MoneyText({ cents, signed = false, projected = false, className }: MoneyTextProps) {
  const text = signed ? formatMoneySigned(cents) : formatMoney(cents);
  return (
    <span className={cn("tabular font-mono", projected && "opacity-60", className)}>{text}</span>
  );
}
