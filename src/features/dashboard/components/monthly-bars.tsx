"use client";

import { memo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MonthlyComparison } from "@/core/api/types";
import { monthShort } from "@/core/format/date";
import { formatMoneyCompact } from "@/core/format/money";

interface MonthlyBarsProps {
  data: MonthlyComparison[];
}

export const MonthlyBars = memo(function MonthlyBars({ data }: MonthlyBarsProps) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barGap={4}>
          <XAxis
            dataKey="month"
            tickFormatter={(value: string) => monthShort(value)}
            stroke="#1A1A20"
            tick={{ fill: "#A1A1AA", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#1A1A20" }}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "#1A1A20" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-md border border-ink-800 bg-ink-850 px-2 py-1.5 text-micro text-bone shadow-md">
                  <p className="mb-1 font-medium capitalize">{monthShort(String(label))}</p>
                  {payload.map((item) => (
                    <p key={item.dataKey as string} className="tabular font-mono">
                      {item.dataKey === "incomeCents" ? "Entradas" : "Saídas"}:{" "}
                      {formatMoneyCompact(Number(item.value))}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Bar dataKey="incomeCents" fill="#FFFFFF" opacity={0.85} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="expenseCents" fill="#FF6A00" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
