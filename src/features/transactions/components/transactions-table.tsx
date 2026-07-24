"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, Columns3, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Category, Transaction } from "@/core/api/types";
import { dayLabel } from "@/core/format/date";
import { CategoryBadge } from "@/shared/components/category-badge";
import { EmptyState } from "@/shared/components/empty-state";
import { MoneyText } from "@/shared/components/money-text";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { useDeleteTransaction } from "../hooks/use-transaction-mutations";
import { EditScopeDialog } from "./edit-scope-dialog";

interface TransactionsTableProps {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onEdit: (transaction: Transaction) => void;
}

function categoryFor(categories: Category[], id: string | null) {
  return categories.find((category) => category.id === id);
}

export function TransactionsTable({
  transactions,
  categories,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onEdit,
}: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "occurredAt", desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [scopeTarget, setScopeTarget] = useState<Transaction | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const deleteTransaction = useDeleteTransaction();

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  function handleDelete(transaction: Transaction) {
    if (transaction.installmentGroupId) {
      setScopeTarget(transaction);
      return;
    }
    deleteTransaction.mutate({ id: transaction.id });
  }

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar tudo"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "occurredAt",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data <ArrowUpDown className="size-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="tabular font-mono text-small text-bone-600">
            {dayLabel(row.original.occurredAt)}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Descrição",
        cell: ({ row }) => {
          const category = categoryFor(categories, row.original.categoryId);
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-bone">{row.original.description || category?.name || "—"}</span>
              {category && <CategoryBadge name={category.name} color={category.color} />}
            </div>
          );
        },
      },
      {
        accessorKey: "paymentMethod",
        header: "Método",
        cell: ({ row }) => <span className="text-bone-600">{paymentLabel(row.original.paymentMethod)}</span>,
      },
      {
        id: "installment",
        header: "Parcela",
        cell: ({ row }) =>
          row.original.installmentTotal && row.original.installmentTotal > 1 ? (
            <span className="tabular font-mono text-small text-bone-600">
              {row.original.installmentNumber}/{row.original.installmentTotal}
            </span>
          ) : (
            <span className="text-bone-800">—</span>
          ),
      },
      {
        accessorKey: "amountCents",
        header: () => <span className="block text-right">Valor</span>,
        cell: ({ row }) => {
          const transaction = row.original;
          const signed = transaction.type === "EXPENSE" ? -transaction.amountCents : transaction.amountCents;
          return (
            <div className="block w-full text-right">
              <MoneyText
                cents={signed}
                signed
                projected={transaction.isProjected}
                className="text-bone"
              />
              {transaction.isProjected && (
                <Badge variant="projected" className="ml-2">
                  projetado
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ações">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(row.original)}>Editar</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleDelete(row.original)}
                className="text-ember"
              >
                <Trash2 className="size-3.5" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleDelete usa mutation estável e setState
    [categories, onEdit],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  const selectedCount = Object.keys(rowSelection).length;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Nenhum lançamento neste período."
        description="Registre o primeiro pela command bar (⌘K) ou pelo botão “Novo lançamento”."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-small text-bone-600">
          {selectedCount > 0 ? (
            <span className="flex items-center gap-3">
              {selectedCount} selecionado(s)
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  const ids = Object.keys(rowSelection);
                  try {
                    for (const id of ids) {
                      await deleteTransaction.mutateAsync({ id });
                    }
                    setRowSelection({});
                  } catch {
                    // The mutation hook shows the error toast; preserve remaining selection.
                  }
                }}
              >
                Excluir selecionados
              </Button>
            </span>
          ) : (
            `${transactions.length} lançamento(s)`
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3 className="size-3.5" /> Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && <Skeleton className="h-10 w-full" />}

      <EditScopeDialog
        open={scopeTarget !== null}
        onOpenChange={(value) => !value && setScopeTarget(null)}
        onConfirm={(scope) => {
          if (scopeTarget) deleteTransaction.mutate({ id: scopeTarget.id, scope });
          setScopeTarget(null);
        }}
      />
    </div>
  );
}

function paymentLabel(method: string): string {
  switch (method) {
    case "PIX":
      return "Pix";
    case "DEBIT":
      return "Débito";
    case "CREDIT":
      return "Crédito";
    case "CASH":
      return "Dinheiro";
    default:
      return method;
  }
}
