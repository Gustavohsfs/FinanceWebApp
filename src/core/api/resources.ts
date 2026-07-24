import "server-only";

import { apiFetch } from "./server-client";
import type {
  Account,
  AggregationBasis,
  BalancePoint,
  BudgetStatus,
  Category,
  CategoryInsight,
  CategoryType,
  CreateTransactionInput,
  CreditCard,
  EditScope,
  Goal,
  GoalKind,
  GoalProgress,
  GoalRecurrence,
  Invoice,
  MonthlyComparison,
  PaymentMethod,
  Recurrence,
  Session,
  SummaryResponse,
  Transaction,
  TransactionsPage,
  TransactionType,
  UpdateAccountInput,
  UpdateCreditCardInput,
  UpdateTransactionInput,
  User,
} from "./types";

export const authApi = {
  register: (input: { email: string; password: string; name: string }) =>
    apiFetch<Session>("/v1/auth/register", { method: "POST", body: input }),
  login: (input: { email: string; password: string }) =>
    apiFetch<Session>("/v1/auth/login", { method: "POST", body: input }),
  refresh: (refreshToken: string) =>
    apiFetch<Session>("/v1/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    }),
  logout: (refreshToken: string) =>
    apiFetch<void>("/v1/auth/logout", {
      method: "POST",
      body: { refreshToken },
    }),
  logoutAll: (accessToken: string) =>
    apiFetch<void>("/v1/auth/logout-all", { method: "POST", accessToken }),
  me: (accessToken: string) => apiFetch<User>("/v1/auth/me", { accessToken }),
  changePassword: (
    accessToken: string,
    input: { currentPassword: string; newPassword: string },
  ) =>
    apiFetch<void>("/v1/auth/password", {
      method: "PATCH",
      accessToken,
      body: input,
    }),
};

export const accountsApi = {
  list: (accessToken: string) =>
    apiFetch<Account[]>("/v1/accounts", { accessToken }),
  create: (
    accessToken: string,
    input: {
      name: string;
      kind: Account["kind"];
      openingBalanceCents?: number;
      currency?: string;
    },
  ) =>
    apiFetch<Account>("/v1/accounts", {
      method: "POST",
      accessToken,
      body: input,
    }),
  update: (accessToken: string, id: string, input: UpdateAccountInput) =>
    apiFetch<Account>(`/v1/accounts/${id}`, {
      method: "PATCH",
      accessToken,
      body: input,
    }),
  delete: (accessToken: string, id: string) =>
    apiFetch<void>(`/v1/accounts/${id}`, { method: "DELETE", accessToken }),
};

export const creditCardsApi = {
  list: (accessToken: string) =>
    apiFetch<CreditCard[]>("/v1/credit-cards", { accessToken }),
  create: (
    accessToken: string,
    input: {
      accountId: string;
      name: string;
      limitCents: number;
      closingDay: number;
      dueDay: number;
    },
  ) =>
    apiFetch<CreditCard>("/v1/credit-cards", {
      method: "POST",
      accessToken,
      body: input,
    }),
  invoice: (accessToken: string, id: string, month: string) =>
    apiFetch<Invoice>(`/v1/credit-cards/${id}/invoices`, {
      accessToken,
      query: { month },
    }),
  update: (accessToken: string, id: string, input: UpdateCreditCardInput) =>
    apiFetch<CreditCard>(`/v1/credit-cards/${id}`, {
      method: "PATCH",
      accessToken,
      body: input,
    }),
  delete: (accessToken: string, id: string) =>
    apiFetch<void>(`/v1/credit-cards/${id}`, { method: "DELETE", accessToken }),
};

export const categoriesApi = {
  list: (
    accessToken: string,
    params?: { type?: CategoryType; includeArchived?: boolean },
  ) =>
    apiFetch<Category[]>("/v1/categories", {
      accessToken,
      query: { type: params?.type, includeArchived: params?.includeArchived },
    }),
  create: (
    accessToken: string,
    input: {
      name: string;
      icon: string;
      color: string;
      type: CategoryType;
      parentId?: string;
      monthlyBudgetCents?: number;
    },
  ) =>
    apiFetch<Category>("/v1/categories", {
      method: "POST",
      accessToken,
      body: input,
    }),
  update: (
    accessToken: string,
    id: string,
    input: Partial<{
      name: string;
      icon: string;
      color: string;
      parentId: string;
      monthlyBudgetCents: number;
    }>,
  ) =>
    apiFetch<Category>(`/v1/categories/${id}`, {
      method: "PATCH",
      accessToken,
      body: input,
    }),
  archive: (accessToken: string, id: string) =>
    apiFetch<Category>(`/v1/categories/${id}/archive`, {
      method: "POST",
      accessToken,
    }),
};

export interface TransactionsListParams {
  from?: string;
  to?: string;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  creditCardId?: string;
  method?: PaymentMethod;
  basis?: AggregationBasis;
  cursor?: string;
  limit?: number;
}

export const transactionsApi = {
  list: (accessToken: string, params: TransactionsListParams = {}) =>
    apiFetch<TransactionsPage>("/v1/transactions", {
      accessToken,
      query: { ...params },
    }),
  get: (accessToken: string, id: string) =>
    apiFetch<Transaction>(`/v1/transactions/${id}`, { accessToken }),
  create: (
    accessToken: string,
    input: CreateTransactionInput,
    idempotencyKey: string,
  ) =>
    apiFetch<Transaction[]>("/v1/transactions", {
      method: "POST",
      accessToken,
      body: input,
      idempotencyKey,
    }),
  update: (
    accessToken: string,
    id: string,
    input: UpdateTransactionInput,
    scope: EditScope = "one",
  ) =>
    apiFetch<Transaction[]>(`/v1/transactions/${id}`, {
      method: "PATCH",
      accessToken,
      body: input,
      query: { scope },
    }),
  delete: (accessToken: string, id: string, scope: EditScope = "one") =>
    apiFetch<void>(`/v1/transactions/${id}`, {
      method: "DELETE",
      accessToken,
      query: { scope },
    }),
};

export const insightsApi = {
  summary: (
    accessToken: string,
    month: string,
    basis: AggregationBasis = "accrual",
  ) =>
    apiFetch<SummaryResponse>("/v1/insights/summary", {
      accessToken,
      query: { month, basis },
    }),
  byCategory: (
    accessToken: string,
    from: string,
    to: string,
    type: "INCOME" | "EXPENSE" = "EXPENSE",
  ) =>
    apiFetch<CategoryInsight[]>("/v1/insights/by-category", {
      accessToken,
      query: { from, to, type },
    }),
  balanceSeries: (
    accessToken: string,
    from: string,
    to: string,
    basis: AggregationBasis = "accrual",
  ) =>
    apiFetch<BalancePoint[]>("/v1/insights/balance-series", {
      accessToken,
      query: { from, to, granularity: "day", basis },
    }),
  monthlyComparison: (accessToken: string, months = 6) =>
    apiFetch<MonthlyComparison[]>("/v1/insights/monthly-comparison", {
      accessToken,
      query: { months },
    }),
  budgetStatus: (
    accessToken: string,
    month: string,
    basis: AggregationBasis = "accrual",
  ) =>
    apiFetch<BudgetStatus[]>("/v1/insights/budget-status", {
      accessToken,
      query: { month, basis },
    }),
};

export const goalsApi = {
  list: (accessToken: string) => apiFetch<Goal[]>("/v1/goals", { accessToken }),
  create: (
    accessToken: string,
    input: {
      name: string;
      kind: GoalKind;
      targetCents: number;
      categoryId?: string;
      startDate: string;
      deadline: string;
      recurrence: GoalRecurrence;
    },
  ) =>
    apiFetch<Goal>("/v1/goals", { method: "POST", accessToken, body: input }),
  update: (
    accessToken: string,
    id: string,
    input: Partial<{
      name: string;
      targetCents: number;
      categoryId: string | null;
      startDate: string;
      deadline: string;
      recurrence: GoalRecurrence;
    }>,
  ) =>
    apiFetch<Goal>(`/v1/goals/${id}`, {
      method: "PATCH",
      accessToken,
      body: input,
    }),
  progress: (
    accessToken: string,
    id: string,
    basis: AggregationBasis = "accrual",
  ) =>
    apiFetch<GoalProgress>(`/v1/goals/${id}/progress`, {
      accessToken,
      query: { basis },
    }),
};

export const recurrencesApi = {
  list: (accessToken: string) =>
    apiFetch<Recurrence[]>("/v1/recurrences", { accessToken }),
  create: (
    accessToken: string,
    input: {
      type: "INCOME" | "EXPENSE";
      amountCents: number;
      description: string;
      categoryId?: string;
      accountId: string;
      creditCardId?: string;
      paymentMethod: PaymentMethod;
      dayOfMonth: number;
      nextOccurrenceAt: string;
      currency?: string;
      notes?: string;
    },
  ) =>
    apiFetch<Recurrence>("/v1/recurrences", {
      method: "POST",
      accessToken,
      body: input,
    }),
  confirm: (accessToken: string, id: string) =>
    apiFetch<Transaction>(`/v1/recurrences/${id}/confirm`, {
      method: "POST",
      accessToken,
    }),
};
