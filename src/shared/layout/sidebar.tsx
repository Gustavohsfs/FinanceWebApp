"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { cn } from "@/shared/lib/cn";
import { useUiStore } from "@/shared/stores/ui-store";

import { NAV_ITEMS } from "./nav-items";

interface SidebarProps {
  userName: string;
  balanceLabel: string;
}

export function Sidebar({ userName, balanceLabel }: SidebarProps) {
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isTyping) return;
      if (event.key === "[") {
        event.preventDefault();
        toggleSidebar();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-ink-800 bg-ink-900 transition-[width] duration-150",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-ink-800 px-4">
        <span className="size-2.5 shrink-0 rounded-full bg-flame-500" />
        {!collapsed && <span className="font-display text-body font-semibold text-bone">Fluxo</span>}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-small font-medium transition-colors",
                active ? "bg-flame-950 text-flame-400" : "text-bone-600 hover:bg-ink-800 hover:text-bone",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={toggleSidebar}
        className="flex items-center gap-2 border-t border-ink-800 px-4 py-3 text-small text-bone-600 transition-colors hover:text-bone"
        aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
      >
        {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        {!collapsed && <span>Recolher</span>}
      </button>

      <div className="border-t border-ink-800 p-4">
        {!collapsed ? (
          <>
            <p className="truncate text-small font-medium text-bone">{userName}</p>
            <p className="tabular font-mono text-small text-bone-600">{balanceLabel}</p>
          </>
        ) : (
          <div className="flex justify-center">
            <div className="flex size-8 items-center justify-center rounded-full bg-ink-800 text-small font-medium text-bone">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
