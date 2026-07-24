"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

interface ShortcutsHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: "⌘K / Ctrl+K", description: "Abrir a command bar" },
  { keys: "n", description: "Novo lançamento (abre a command bar)" },
  { keys: "/", description: "Buscar ou navegar" },
  { keys: "g d", description: "Ir para o Dashboard" },
  { keys: "g l", description: "Ir para Lançamentos" },
  { keys: "[", description: "Colapsar/expandir a barra lateral" },
  { keys: "?", description: "Mostrar esta ajuda" },
];

export function ShortcutsHelpDialog({ open, onOpenChange }: ShortcutsHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atalhos de teclado</DialogTitle>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.keys} className="flex items-center justify-between gap-4 text-small">
              <span className="text-bone-600">{shortcut.description}</span>
              <kbd className="rounded border border-ink-800 bg-ink-950 px-2 py-0.5 font-mono text-micro text-bone">
                {shortcut.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
