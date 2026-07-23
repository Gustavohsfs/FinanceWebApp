"use client";

import { Search, User } from "lucide-react";
import type { ReactNode } from "react";

import { LogoutButton } from "@/features/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useUiStore } from "@/shared/stores/ui-store";

interface TopbarProps {
  title: string;
  userName: string;
  userEmail: string;
  children?: ReactNode;
}

export function Topbar({ title, userName, userEmail, children }: TopbarProps) {
  const setCommandBarOpen = useUiStore((state) => state.setCommandBarOpen);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-ink-800 px-6">
      <h1 className="truncate font-display text-body font-semibold text-bone">{title}</h1>

      <div className="flex items-center gap-3">
        {children}

        <button
          type="button"
          onClick={() => setCommandBarOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-ink-800 bg-ink-900 px-3 py-1.5 text-small text-bone-600 transition-colors hover:text-bone"
        >
          <Search className="size-3.5" />
          <span className="hidden sm:inline">Buscar ou registrar</span>
          <kbd className="rounded border border-ink-800 bg-ink-950 px-1.5 py-0.5 text-micro text-bone-800">
            ⌘K
          </kbd>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-full bg-ink-800 text-bone-600 transition-colors hover:text-bone"
              aria-label="Menu do usuário"
            >
              <User className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="truncate text-small font-medium text-bone">{userName}</p>
              <p className="truncate text-micro text-bone-800">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/configuracoes">Configurações</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-1 py-0.5">
              <LogoutButton />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
