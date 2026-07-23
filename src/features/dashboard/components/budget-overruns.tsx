import type { BudgetStatus } from "@/core/api/types";
import { formatMoney } from "@/core/format/money";
import { Card } from "@/shared/ui/card";

interface BudgetOverrunsProps {
  data: BudgetStatus[];
}

/** Só aparece se houver orçamento estourado (BRIEF §6.4). */
export function BudgetOverruns({ data }: BudgetOverrunsProps) {
  const overruns = data.filter((item) => item.overCents > 0);
  if (overruns.length === 0) return null;

  return (
    <Card>
      <Card.Header>
        <Card.Title>Orçamentos estourados</Card.Title>
      </Card.Header>
      <Card.Body className="flex flex-col gap-3">
        {overruns.map((item) => (
          <div key={item.categoryId} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-small">
              <span className="text-bone">{item.categoryName}</span>
              <span className="tabular font-mono text-ember">+{formatMoney(item.overCents)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full rounded-full bg-ember"
                style={{ width: `${Math.min(100, item.ratio * 100)}%` }}
              />
            </div>
            <span className="text-micro text-bone-800">
              {formatMoney(item.spentCents)} de {formatMoney(item.budgetCents)}
            </span>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
}
