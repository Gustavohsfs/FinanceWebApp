"use client";

import type { EditScope } from "@/core/api/types";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

interface EditScopeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scope: EditScope) => void;
}

/** Editar/excluir uma parcela pergunta o escopo (BRIEF §7 — aceite de Lançamentos). */
export function EditScopeDialog({ open, onOpenChange, onConfirm }: EditScopeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aplicar a quais parcelas?</DialogTitle>
          <DialogDescription>Esta transação faz parte de uma compra parcelada.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="justify-start" onClick={() => onConfirm("one")}>
            Só esta parcela
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => onConfirm("future")}>
            Esta e as futuras
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => onConfirm("all")}>
            Todas as parcelas
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
