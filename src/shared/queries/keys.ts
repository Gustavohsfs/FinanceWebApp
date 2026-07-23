/** Chaves padronizadas do React Query (BRIEF §8.3). Invalidação por prefixo. */
export const queryKeys = {
  categories: (params?: { type?: string; includeArchived?: boolean }) =>
    ["categories", params ?? {}] as const,
  accounts: () => ["accounts"] as const,
  creditCards: () => ["credit-cards"] as const,
  invoice: (cardId: string, month: string) => ["credit-cards", cardId, "invoice", month] as const,
  transactions: (filters?: unknown) => ["transactions", filters ?? {}] as const,
  transaction: (id: string) => ["transactions", "detail", id] as const,
  goals: () => ["goals"] as const,
  goalProgress: (id: string, basis: string) => ["goals", id, "progress", basis] as const,
  recurrences: () => ["recurrences"] as const,
  insightsSummary: (month: string, basis: string) => ["insights", "summary", month, basis] as const,
  insightsByCategory: (from: string, to: string, type: string) =>
    ["insights", "by-category", from, to, type] as const,
  insightsBalanceSeries: (from: string, to: string, basis: string) =>
    ["insights", "balance-series", from, to, basis] as const,
  insightsMonthlyComparison: (months: number) => ["insights", "monthly-comparison", months] as const,
  insightsBudgetStatus: (month: string, basis: string) =>
    ["insights", "budget-status", month, basis] as const,
};
