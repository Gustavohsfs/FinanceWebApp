"use client";

import { memo, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { CategoryInsight } from "@/core/api/types";
import { formatMoney } from "@/core/format/money";
import { useCategoriesQuery } from "@/shared/queries/use-categories";
import { EmptyState } from "@/shared/components/empty-state";

interface CategoryDonutProps {
  data: CategoryInsight[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export const CategoryDonut = memo(function CategoryDonut({
  data,
  selectedCategoryId,
  onSelect,
}: CategoryDonutProps) {
  const { data: categories = [] } = useCategoriesQuery();
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) map.set(category.id, category.color);
    return map;
  }, [categories]);
  const colorFor = (categoryId: string | null) =>
    (categoryId ? colorMap.get(categoryId) : undefined) ?? "#52525B";

  if (data.length === 0) {
    return <EmptyState title="Nenhuma saída este mês." className="h-64" />;
  }

  return (
    <div className="flex h-64 items-center gap-4">
      <ResponsiveContainer width="60%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="totalCents"
            nameKey="categoryName"
            innerRadius={56}
            outerRadius={88}
            paddingAngle={2}
            isAnimationActive={false}
            onClick={(entry) => {
              const id = (entry as unknown as CategoryInsight).categoryId;
              onSelect(selectedCategoryId === id ? null : id);
            }}
          >
            {data.map((entry) => (
              <Cell
                key={entry.categoryId ?? "sem-categoria"}
                fill={colorFor(entry.categoryId)}
                opacity={selectedCategoryId && selectedCategoryId !== entry.categoryId ? 0.35 : 1}
                cursor="pointer"
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const point = payload[0].payload as CategoryInsight;
              return (
                <div className="rounded-md border border-ink-800 bg-ink-850 px-2 py-1 text-micro text-bone shadow-md">
                  {point.categoryName ?? "Sem categoria"} · {formatMoney(point.totalCents)}
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex flex-1 flex-col gap-1.5 text-small">
        {data.slice(0, 6).map((entry) => (
          <li key={entry.categoryId ?? "sem-categoria"}>
            <button
              type="button"
              onClick={() => onSelect(selectedCategoryId === entry.categoryId ? null : entry.categoryId)}
              className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-ink-900"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: colorFor(entry.categoryId) }}
              />
              <span className="flex-1 truncate text-bone-600">{entry.categoryName ?? "Sem categoria"}</span>
              <span className="tabular font-mono text-bone">{formatMoney(entry.totalCents)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});
