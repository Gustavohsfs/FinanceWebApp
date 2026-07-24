export type UUID = string;
export type ISODateTime = string;

export interface User {
  id: UUID;
  email: string;
  name: string;
  timezone: string;
  currency: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: User;
}

export type AccountKind = "CHECKING" | "CASH" | "SAVINGS" | "INVESTMENT";

export interface Account {
  id: UUID;
  userId: UUID;
  name: string;
  kind: AccountKind;
  openingBalanceCents: number;
  currency: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface UpdateAccountInput {
  name?: string;
  kind?: AccountKind;
  openingBalanceCents?: number;
  currency?: string;
}

export interface CreditCard {
  id: UUID;
  userId: UUID;
  accountId: UUID;
  name: string;
  limitCents: number;
  closingDay: number;
  dueDay: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface UpdateCreditCardInput {
  accountId?: UUID;
  name?: string;
  limitCents?: number;
  closingDay?: number;
  dueDay?: number;
}

export type InvoiceStatus = "OPEN" | "CLOSED";

export interface Invoice {
  creditCardId: UUID;
  month: string;
  totalCents: number;
  status: InvoiceStatus;
}

export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  id: UUID;
  userId: UUID;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  parentId: UUID | null;
  monthlyBudgetCents: number | null;
  isArchived: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type PaymentMethod = "CASH" | "PIX" | "DEBIT" | "CREDIT";
export type TransactionSource = "MANUAL" | "RECURRENCE" | "OPEN_FINANCE";
export type AggregationBasis = "accrual" | "cash";
export type EditScope = "one" | "future" | "all";

export interface Transaction {
  id: UUID;
  userId: UUID;
  type: TransactionType;
  amountCents: number;
  description: string;
  occurredAt: ISODateTime;
  settledAt: ISODateTime | null;
  categoryId: UUID | null;
  accountId: UUID;
  creditCardId: UUID | null;
  paymentMethod: PaymentMethod;
  installmentGroupId: UUID | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
  isProjected: boolean;
  recurrenceId: UUID | null;
  currency: string;
  notes: string | null;
  source: TransactionSource;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  deletedAt: ISODateTime | null;
}

export interface TransactionsPage {
  data: Transaction[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export interface CreateTransactionInput {
  type: TransactionType;
  amountCents: number;
  description?: string;
  occurredAt: ISODateTime;
  settledAt?: ISODateTime | null;
  categoryId?: UUID;
  accountId: UUID;
  creditCardId?: UUID;
  paymentMethod: PaymentMethod;
  installmentTotal?: number;
  currency?: string;
  notes?: string;
}

export interface UpdateTransactionInput {
  amountCents?: number;
  description?: string;
  occurredAt?: ISODateTime;
  settledAt?: ISODateTime | null;
  categoryId?: UUID | null;
  accountId?: UUID;
  creditCardId?: UUID | null;
  paymentMethod?: PaymentMethod;
  notes?: string | null;
  isProjected?: boolean;
}

export type GoalKind = "SAVING" | "INVESTMENT" | "SPEND_LIMIT";
export type GoalRecurrence = "ONCE" | "MONTHLY";

export interface Goal {
  id: UUID;
  userId: UUID;
  name: string;
  kind: GoalKind;
  targetCents: number;
  categoryId: UUID | null;
  startDate: ISODateTime;
  deadline: ISODateTime;
  recurrence: GoalRecurrence;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface GoalProgress {
  goalId: UUID;
  plannedCents: number;
  effectuatedCents: number;
  ratio: number;
  isOver: boolean;
  projectionLabel: string;
}

export interface Recurrence {
  id: UUID;
  userId: UUID;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  description: string;
  categoryId: UUID | null;
  accountId: UUID;
  creditCardId: UUID | null;
  paymentMethod: PaymentMethod;
  frequency: "MONTHLY";
  dayOfMonth: number;
  nextOccurrenceAt: ISODateTime;
  isActive: boolean;
  currency: string;
  notes: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface SummaryResponse {
  month: string;
  basis: AggregationBasis;
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
  previousBalanceCents: number;
  deltaPercent: number | null;
}

export interface CategoryInsight {
  categoryId: UUID | null;
  categoryName: string | null;
  totalCents: number;
}

export interface BalancePoint {
  day: string;
  cumulativeCents: number;
}

export interface MonthlyComparison {
  month: string;
  incomeCents: number;
  expenseCents: number;
}

export interface BudgetStatus {
  categoryId: UUID;
  categoryName: string;
  budgetCents: number;
  spentCents: number;
  overCents: number;
  ratio: number;
}
