"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { dayShortLabelFromKey } from "@/core/format/date";
import { formatMoney } from "@/core/format/money";
import { EmptyState } from "@/shared/components/empty-state";

import type { DayPoint } from "../lib/aggregate";

interface BalanceHeroChartProps {
  data: DayPoint[];
  monthLabel: string;
}

/**
 * O readout (números da esquerda) é o único pedaço que reage ao hover.
 * Fica separado do gráfico para que mover o mouse NÃO re-renderize o
 * AreaChart do Recharts — só este bloco de texto.
 */
const HeroReadout = memo(function HeroReadout({ point }: { point: DayPoint | null }) {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-10 flex flex-col gap-1 p-1">
      <p className="font-display text-hero font-semibold tabular text-bone">
        {point ? formatMoney(point.cumulativeBalanceCents) : "—"}
      </p>
      <p className="text-small text-bone-600">
        saldo em {point ? dayShortLabelFromKey(point.day) : "—"}
      </p>
      <div className="mt-2 flex flex-col gap-0.5 text-small">
        <span className="tabular font-mono text-bone-600">
          ↑ entradas {point ? formatMoney(point.cumulativeIncomeCents) : "—"}
        </span>
        <span className="tabular font-mono text-bone-600">
          ↓ saídas {point ? formatMoney(point.cumulativeExpenseCents) : "—"}
        </span>
      </div>
    </div>
  );
});

/**
 * O gráfico em si. Recebe só `data` e um callback estável de hover; como não
 * depende do índice ativo, o `memo` garante que ele nunca re-renderiza ao
 * mover o mouse. O crosshair é desenhado pelo próprio Recharts, sem React.
 */
const HeroArea = memo(function HeroArea({
  data,
  onHover,
  onLeave,
}: {
  data: DayPoint[];
  onHover: (index: number) => void;
  onLeave: () => void;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
        onMouseMove={(state) => {
          if (state && typeof state.activeTooltipIndex === "number") {
            onHover(state.activeTooltipIndex);
          }
        }}
        onMouseLeave={onLeave}
      >
        <defs>
          <linearGradient id="balance-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6A00" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#FF6A00" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          tickFormatter={(value: string) => value.slice(8, 10)}
          stroke="#1A1A20"
          tick={{ fill: "#A1A1AA", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#1A1A20" }}
          minTickGap={24}
        />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip cursor={{ stroke: "#FF6A00", strokeWidth: 1 }} content={() => null} isAnimationActive={false} />
        <Area
          type="monotone"
          dataKey="cumulativeBalanceCents"
          stroke="#FF8A2B"
          strokeWidth={2}
          fill="url(#balance-gradient)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

/** Assinatura 2 do web (BRIEF §6.4): saldo em área com crosshair sincronizado. */
export function BalanceHeroChart({ data, monthLabel }: BalanceHeroChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Só atualiza quando o índice realmente muda — evita re-render redundante
  // enquanto o cursor anda dentro da mesma faixa de um dia.
  const handleHover = useCallback((index: number) => {
    setHoverIndex((prev) => (prev === index ? prev : index));
  }, []);
  const handleLeave = useCallback(() => setHoverIndex(null), []);

  const activePoint = useMemo(() => {
    if (data.length === 0) return null;
    if (hoverIndex !== null && data[hoverIndex]) return data[hoverIndex];
    return data[data.length - 1] ?? null;
  }, [data, hoverIndex]);

  if (data.length === 0) {
    return (
      <EmptyState
        title={`Nenhum lançamento em ${monthLabel}.`}
        description="Registre o primeiro pela command bar (⌘K) ou pelo botão “Novo lançamento” em Lançamentos."
        className="h-80"
      />
    );
  }

  return (
    <div className="relative h-80 w-full">
      <HeroReadout point={activePoint} />
      <HeroArea data={data} onHover={handleHover} onLeave={handleLeave} />
    </div>
  );
}
