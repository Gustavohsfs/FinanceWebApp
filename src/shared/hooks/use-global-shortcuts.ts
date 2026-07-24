"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useUiStore } from "@/shared/stores/ui-store";

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || !!el?.isContentEditable;
}

/**
 * Atalhos globais (BRIEF §6.7): `n`/`/` abrem a command bar, `g d`/`g l`
 * navegam, `[` recolhe a sidebar, `?` abre a ajuda de atalhos.
 */
export function useGlobalShortcuts(onOpenHelp: () => void) {
  const router = useRouter();
  const setCommandBarOpen = useUiStore((state) => state.setCommandBarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const pendingG = useRef(false);
  const pendingGTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      if (pendingG.current) {
        pendingG.current = false;
        clearTimeout(pendingGTimeout.current);
        if (event.key === "d") {
          event.preventDefault();
          router.push("/");
        } else if (event.key === "l") {
          event.preventDefault();
          router.push("/lancamentos");
        }
        return;
      }

      if (event.key === "g") {
        pendingG.current = true;
        pendingGTimeout.current = setTimeout(() => {
          pendingG.current = false;
        }, 600);
        return;
      }

      if (event.key === "/" || event.key === "n") {
        event.preventDefault();
        setCommandBarOpen(true);
        return;
      }

      if (event.key === "[") {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        onOpenHelp();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(pendingGTimeout.current);
    };
  }, [router, setCommandBarOpen, toggleSidebar, onOpenHelp]);
}
