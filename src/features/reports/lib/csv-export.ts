import { formatMoneyCompact } from "@/core/format/money";

import { METHOD_ORDER, type CrossTabRow } from "./cross-tab";

const METHOD_LABELS: Record<string, string> = { CASH: "Dinheiro", PIX: "Pix", DEBIT: "Débito", CREDIT: "Crédito" };

function escapeCsvField(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildReportCsv(rows: CrossTabRow[]): string {
  const header = ["Categoria", ...METHOD_ORDER.map((method) => METHOD_LABELS[method]), "Total"];
  const lines = [header.join(";")];

  for (const row of rows) {
    const cells = [
      row.categoryName,
      ...METHOD_ORDER.map((method) => formatMoneyCompact(row.totalsByMethod[method])),
      formatMoneyCompact(row.total),
    ];
    lines.push(cells.map(escapeCsvField).join(";"));
  }

  return lines.join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
