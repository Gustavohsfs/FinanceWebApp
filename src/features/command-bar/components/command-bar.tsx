"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { newIdempotencyKey } from "@/core/api/id";
import { proxyFetch } from "@/core/api/client-fetch";
import { nowISO } from "@/core/format/date";
import { formatMoney } from "@/core/format/money";
import type { CreateTransactionInput, Transaction } from "@/core/api/types";
import { NAV_ITEMS } from "@/shared/layout/nav-items";
import { Badge } from "@/shared/ui/badge";
import { useAccountsQuery } from "@/shared/queries/use-accounts";
import { useCategoriesQuery } from "@/shared/queries/use-categories";
import { useCreditCardsQuery } from "@/shared/queries/use-credit-cards";
import { useUiStore } from "@/shared/stores/ui-store";

import { parseEntry } from "../lib/parse-entry";

export function CommandBar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const open = useUiStore((state) => state.commandBarOpen);
  const setOpen = useUiStore((state) => state.setCommandBarOpen);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: categories = [] } = useCategoriesQuery({ type: "EXPENSE" });
  const { data: accounts = [] } = useAccountsQuery();
  const { data: creditCards = [] } = useCreditCardsQuery();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setSearch("");
  }

  const parsed = useMemo(() => {
    if (!search.trim()) return null;
    const hasDigit = /\d/.test(search);
    if (!hasDigit) return null;
    return parseEntry(search, categories);
  }, [search, categories]);

  async function handleSave() {
    if (!parsed || parsed.amountCents === null || parsed.amountCents <= 0 || saving) return;

    const account = accounts[0];
    if (!account) {
      toast.error("Crie uma conta em Contas e cartões antes de registrar.");
      return;
    }

    const categoryId = parsed.categoryId;
    if (!categoryId) {
      toast.error("Não reconheci a categoria. Inclua o nome dela no texto.");
      return;
    }

    const paymentMethod = parsed.paymentMethod ?? "PIX";
    let creditCardId: string | undefined;
    if (paymentMethod === "CREDIT") {
      creditCardId = creditCards[0]?.id;
      if (!creditCardId) {
        toast.error("Crie um cartão em Contas e cartões antes de registrar no crédito.");
        return;
      }
    }

    setSaving(true);
    try {
      const now = nowISO();
      const input: CreateTransactionInput = {
        type: "EXPENSE",
        amountCents: parsed.amountCents,
        description: parsed.description || parsed.categoryName || "",
        occurredAt: now,
        categoryId,
        accountId: account.id,
        paymentMethod,
        installmentTotal: parsed.installments,
        ...(creditCardId ? { creditCardId } : {}),
      };
      await proxyFetch<Transaction[]>("/transactions", {
        method: "POST",
        body: input,
        idempotencyKey: newIdempotencyKey(),
      });
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["insights"] });
      toast.success(`Gasto de ${formatMoney(parsed.amountCents)} salvo.`);
      setOpen(false);
    } catch {
      toast.error("Não foi possível salvar o gasto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={handleOpenChange}
      label="Command bar"
      shouldFilter={!parsed}
      className="fixed left-1/2 top-24 z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-2xl"
      onKeyDown={(event) => {
        if (event.key === "Enter" && parsed) {
          event.preventDefault();
          void handleSave();
        }
      }}
    >
      <div className="border-b border-ink-800 px-4">
        <Command.Input
          autoFocus
          value={search}
          onValueChange={setSearch}
          placeholder="Navegue ou registre: 45,90 mercado crédito 3x"
          className="h-14 w-full bg-transparent text-body text-bone placeholder:text-bone-800 focus:outline-none"
        />
      </div>

      {parsed && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-800 px-4 py-3">
          <Badge variant="flame">
            {parsed.amountCents !== null ? formatMoney(parsed.amountCents) : "sem valor"}
          </Badge>
          {parsed.categoryName && <Badge variant="neutral">{parsed.categoryName}</Badge>}
          {parsed.paymentMethod && <Badge variant="neutral">{paymentLabel(parsed.paymentMethod)}</Badge>}
          {parsed.installments > 1 && parsed.amountCents !== null && (
            <Badge variant="neutral">
              {parsed.installments}× de {formatMoney(Math.round(parsed.amountCents / parsed.installments))}
            </Badge>
          )}
          <span className="ml-auto text-micro text-bone-800">Enter para salvar</span>
        </div>
      )}

      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-small text-bone-600">
          {parsed ? "Pronto para salvar — aperte Enter." : "Nenhum resultado."}
        </Command.Empty>

        {!parsed && (
          <Command.Group heading="Navegar" className="text-micro text-bone-800 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5">
            {NAV_ITEMS.map((item) => (
              <Command.Item
                key={item.href}
                value={`${item.label} ${item.keywords.join(" ")}`}
                onSelect={() => {
                  router.push(item.href);
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-small text-bone data-[selected=true]:bg-ink-800"
              >
                <item.icon className="size-4 text-bone-600" />
                {item.label}
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
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
