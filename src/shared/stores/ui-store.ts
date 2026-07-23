import { create } from "zustand";

/**
 * Estado de UI apenas — nunca dado de servidor (guardrail §10.5).
 * Filtros, período em memória e toggles de interface vivem aqui.
 */
interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandBarOpen: boolean;
  setCommandBarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  commandBarOpen: false,
  setCommandBarOpen: (open) => set({ commandBarOpen: open }),
}));
