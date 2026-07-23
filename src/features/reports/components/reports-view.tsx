"use client";

import { Download } from "lucide-react";
import { useMemo, useState } from "react";

import type { AggregationBasis } from "@/core/api/types";
import { currentMonthKey, formatDateInput, monthRangeUTC } from "@/core/format/date";
import { formatMoney } from "@/core/format/money";
import { BasisToggle } from "@/shared/components/basis-toggle";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { useCategoriesQuery } from "@/shared/queries/use-categories";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { useReportTransactionsQuery } from "../hooks/use-reports-query";
import { buildCrossTab, METHOD_ORDER } from "../lib/cross-tab";
import { buildReportCsv, downloadCsv } from "../lib/csv-export";

const METHOD_LABELS: Record<string, string> = { CASH: "Dinheiro", PIX: "Pix", DEBIT: "Débito", CREDIT: "Crédito" };

export function ReportsView() {
  const defaultRange = monthRangeUTC(currentMonthKey());
  const [from, setFrom] = useState(formatDateInput(defaultRange.from));
  const [to, setTo] = useState(formatDateInput(defaultRange.to));
  const [basis, setBasis] = useState<AggregationBasis>("accrual");

  const { data: categories = [] } = useCategoriesQuery();
  const fromIso = `${from}T00:00:00-03:00`;
  const toIso = `${to}T23:59:59-03:00`;
  const { data, isLoading, isError, refetch } = useReportTransactionsQuery(fromIso, toIso, basis);

  const rows = useMemo(
    () => buildCrossTab(data?.data ?? [], categories),
    [data, categories],
  );

  const totalsByMethod = useMemo(() => {
    const totals: Record<string, number> = { CASH: 0, PIX: 0, DEBIT: 0, CREDIT: 0 };
    for (const row of rows) {
      for (const method of METHOD_ORDER) totals[method] = (totals[method] ?? 0) + row.totalsByMethod[method];
    }
    return totals;
  }, [rows]);

  const grandTotal = rows.reduce((acc, row) => acc + row.total, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-from">De</Label>
            <Input id="report-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-to">Até</Label>
            <Input id="report-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </div>
          <BasisToggle basis={basis} onChange={setBasis} />
        </div>
        <Button
          variant="outline"
          disabled={rows.length === 0}
          onClick={() => downloadCsv(`relatorio-${from}-a-${to}.csv`, buildReportCsv(rows))}
        >
          <Download className="size-4" /> Exportar CSV
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nenhuma saída no período."
          description="Ajuste o período ou registre lançamentos para ver o cruzamento por categoria e método."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              {METHOD_ORDER.map((method) => (
                <TableHead key={method} className="text-right">
                  {METHOD_LABELS[method]}
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.categoryId}>
                <TableCell>{row.categoryName}</TableCell>
                {METHOD_ORDER.map((method) => (
                  <TableCell key={method} className="tabular text-right font-mono">
                    {formatMoney(row.totalsByMethod[method])}
                  </TableCell>
                ))}
                <TableCell className="tabular text-right font-mono font-medium">
                  {formatMoney(row.total)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-ink-900/60">
              <TableCell className="font-medium text-bone">Total</TableCell>
              {METHOD_ORDER.map((method) => (
                <TableCell key={method} className="tabular text-right font-mono font-medium">
                  {formatMoney(totalsByMethod[method] ?? 0)}
                </TableCell>
              ))}
              <TableCell className="tabular text-right font-mono font-semibold">
                {formatMoney(grandTotal)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  );
}
