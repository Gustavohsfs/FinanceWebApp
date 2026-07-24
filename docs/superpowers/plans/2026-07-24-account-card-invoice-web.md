# Account, Card, and Invoice Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let web users edit and delete accounts and credit cards, inspect a card’s monthly invoice, and correct its total through the existing transaction mutation flow.

**Architecture:** Keep server state in TanStack Query and route all browser requests through the existing BFF proxy. Reuse the current account/card sheets in create and edit modes, and reuse `TransactionFormSheet` plus transaction deletion hooks for invoice items.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript strict, Tailwind CSS v4, TanStack Query v5, react-hook-form, Zod, Radix Dialog/Sheet, Sonner.

## Global Constraints

- Browser calls go only through `/api/proxy/*`; no direct API URL and no browser-visible token.
- Money remains integer cents and is parsed only by `core/format/money.ts`.
- No `parseFloat`, `toFixed`, or monetary calculation inside components.
- Server state stays in TanStack Query, never Zustand.
- Existing design tokens, typography, `tabular-nums`, keyboard focus, and `aria-label` rules remain mandatory.
- Projected transactions remain visually distinct.
- No new test framework: the repository brief requires typecheck and lint as blocking checks.
- API plan `FinanceAPI/docs/superpowers/plans/2026-07-24-account-card-invoice-api.md` must be complete first.

---

## File Structure

- `src/core/api/types.ts`: update DTO types and `creditCardId` list filter.
- `src/core/api/resources.ts`: server-side account/card lifecycle methods.
- `src/core/api/errors.ts`: messages for the four new conflict codes.
- `src/features/accounts/hooks/use-account-mutations.ts`: account create/update/delete hooks.
- `src/features/accounts/hooks/use-credit-card-mutations.ts`: card create/update/delete and invoice hooks.
- `src/features/accounts/components/account-form-sheet.tsx`: create/edit account form.
- `src/features/accounts/components/credit-card-form-sheet.tsx`: create/edit card form.
- `src/features/accounts/components/resource-delete-dialog.tsx`: shared feature-level confirmation dialog.
- `src/features/accounts/components/account-item.tsx`: account presentation and actions.
- `src/features/accounts/components/credit-card-item.tsx`: card presentation, actions, and invoice entry point.
- `src/features/accounts/components/invoice-detail-sheet.tsx`: invoice total, item list, edit/delete actions, and states.
- `src/features/accounts/components/accounts-view.tsx`: orchestrate selected resources and sheets.
- `src/features/transactions/hooks/use-transactions-query.ts`: `creditCardId` filter type.
- `src/features/transactions/hooks/use-transaction-mutations.ts`: invalidate invoice queries after item changes.
- `src/features/transactions/components/transactions-table.tsx`: remove the floating-point inline amount path and route editing through the form sheet.
- `src/shared/queries/keys.ts`: invoice-item query key via the existing transactions key.

### Task 1: Add typed account/card lifecycle clients and error messages

**Files:**
- Modify: `src/core/api/types.ts`
- Modify: `src/core/api/resources.ts`
- Modify: `src/core/api/errors.ts`
- Modify: `src/features/accounts/hooks/use-account-mutations.ts`
- Modify: `src/features/accounts/hooks/use-credit-card-mutations.ts`
- Modify: `src/features/transactions/hooks/use-transactions-query.ts`

**Interfaces:**
- Consumes API methods from the completed backend plan.
- Produces:

```ts
export interface UpdateAccountInput {
  name?: string;
  kind?: AccountKind;
  openingBalanceCents?: number;
  currency?: string;
}

export interface UpdateCreditCardInput {
  accountId?: UUID;
  name?: string;
  limitCents?: number;
  closingDay?: number;
  dueDay?: number;
}

export interface TransactionsFilters {
  creditCardId?: string;
  // existing fields remain unchanged
}

useInvoiceQuery(creditCardId: string, month: string, enabled?: boolean)
useTransactionsInfiniteQuery(filters: TransactionsFilters, enabled?: boolean)
useUpdateAccount(): UseMutationResult<Account, Error, { id: string; input: UpdateAccountInput }>
useDeleteAccount(): UseMutationResult<void, Error, string>
useUpdateCreditCard(): UseMutationResult<CreditCard, Error, { id: string; input: UpdateCreditCardInput }>
useDeleteCreditCard(): UseMutationResult<void, Error, string>
```

- [ ] **Step 1: Extend API types and server resources**

Add the two update interfaces to `types.ts`. Add optional `creditCardId` to
`TransactionsListParams`. In `resources.ts` add:

```ts
update: (accessToken: string, id: string, input: UpdateAccountInput) =>
  apiFetch<Account>(`/v1/accounts/${id}`, {
    method: "PATCH",
    accessToken,
    body: input,
  }),
delete: (accessToken: string, id: string) =>
  apiFetch<void>(`/v1/accounts/${id}`, {
    method: "DELETE",
    accessToken,
  }),
```

and equivalent `creditCardsApi.update` / `creditCardsApi.delete`.

- [ ] **Step 2: Add stable conflict messages**

Append exact mappings to `MESSAGES`:

```ts
ACCOUNT_LAST_ACTIVE: "Crie outra conta antes de excluir esta.",
ACCOUNT_HAS_ACTIVE_CARDS: "Exclua ou mova os cartões desta conta antes de continuar.",
ACCOUNT_HAS_ACTIVE_RECURRENCES: "Remova as recorrências desta conta antes de continuar.",
CREDIT_CARD_HAS_ACTIVE_RECURRENCES: "Remova as recorrências deste cartão antes de continuar.",
```

- [ ] **Step 3: Add account mutations**

Implement `useUpdateAccount` and `useDeleteAccount` with proxy paths
`/accounts/:id`. On success invalidate `queryKeys.accounts()` plus
`["transactions"]` and `["insights"]`, close through the calling component, and
show “Conta atualizada.” or “Conta excluída.”. On error use
`ApiRequestError.message`.

- [ ] **Step 4: Add card mutations**

Implement `useUpdateCreditCard` and `useDeleteCreditCard`. Invalidate the
`["credit-cards"]`, `["transactions"]`, and `["insights"]` prefixes so changed
calendar dates refresh invoice totals and cash-basis views.

- [ ] **Step 5: Type the card transaction filter**

Add `creditCardId?: string` to `TransactionsFilters`; the existing query spread
already sends it through the BFF. Add an optional `enabled = true` argument to
`useTransactionsInfiniteQuery` and pass it to `useInfiniteQuery`. Add the same
optional argument to `useInvoiceQuery` and pass it to `useQuery`.

- [ ] **Step 6: Run static checks**

Run:

```powershell
npm run typecheck
npm run lint
```

Expected: PASS with no `any` and no unused exported types.

- [ ] **Step 7: Commit typed clients**

```powershell
git add src/core/api src/features/accounts/hooks src/features/transactions/hooks/use-transactions-query.ts
git commit -m "feat: add account and card lifecycle clients"
```

### Task 2: Reuse account and card sheets for editing

**Files:**
- Modify: `src/features/accounts/components/account-form-sheet.tsx`
- Modify: `src/features/accounts/components/credit-card-form-sheet.tsx`
- Modify: `src/features/accounts/schemas/account-form.schema.ts`
- Modify: `src/features/accounts/schemas/credit-card-form.schema.ts`

**Interfaces:**
- Consumes: `Account`, `CreditCard`, update hooks from Task 1.
- Produces:

```ts
interface AccountFormSheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  account?: Account;
}

interface CreditCardFormSheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  card?: CreditCard;
}
```

- [ ] **Step 1: Add edit props and initial values**

When `account` exists, reset with:

```ts
{
  name: account.name,
  kind: account.kind,
  openingBalance: formatMoneyCompact(account.openingBalanceCents),
}
```

When `card` exists, reset its `accountId`, name, formatted limit, closing day,
and due day. Preserve the current blank defaults for create mode.

- [ ] **Step 2: Route submissions to create or update**

Account edit calls:

```ts
await updateAccount.mutateAsync({
  id: account.id,
  input: {
    name: values.name,
    kind: values.kind,
    openingBalanceCents: parseMoneyInput(values.openingBalance ?? ""),
  },
});
```

Card edit calls the corresponding typed card update. Use
`parseMoneyInput(values.limit)` for both create and update.

- [ ] **Step 3: Make labels and pending state mode-aware**

Use “Editar conta” / “Salvar alterações” and “Editar cartão” / “Salvar
alterações” in edit mode. Disable submit while either relevant mutation is
pending. Keep the form open when the mutation rejects.

- [ ] **Step 4: Run typecheck and lint**

Run:

```powershell
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit reusable forms**

```powershell
git add src/features/accounts/components/*form-sheet.tsx src/features/accounts/schemas
git commit -m "feat: edit accounts and credit cards"
```

### Task 3: Add accessible actions and guarded deletion

**Files:**
- Create: `src/features/accounts/components/resource-delete-dialog.tsx`
- Create: `src/features/accounts/components/account-item.tsx`
- Modify: `src/features/accounts/components/credit-card-item.tsx`
- Modify: `src/features/accounts/components/accounts-view.tsx`

**Interfaces:**
- Consumes update/delete hooks and form sheets from Tasks 1–2.
- Produces:

```ts
interface ResourceDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  pending: boolean;
  onOpenChange(open: boolean): void;
  onConfirm(): void;
}

interface AccountItemProps {
  account: Account;
  onEdit(account: Account): void;
  onDelete(account: Account): void;
}

interface CreditCardItemProps {
  card: CreditCard;
  onEdit(card: CreditCard): void;
  onDelete(card: CreditCard): void;
  onOpenInvoice(card: CreditCard): void;
}
```

- [ ] **Step 1: Build the confirmation dialog**

Compose the existing `Dialog` and `Button` primitives. The destructive button
must say “Excluir conta” or “Excluir cartão”, remain disabled while pending, and
the description must state that historical launches remain preserved.

- [ ] **Step 2: Extract the account card with an action menu**

Move the current account presentation into `AccountItem`. Add a
`MoreHorizontal` icon-only trigger with `aria-label="Ações da conta
<name>"`, plus `Editar` and destructive `Excluir` items.

- [ ] **Step 3: Extend the credit-card item actions**

Add the same accessible menu and a visible `Ver fatura` button. Do not nest
buttons inside another button. Preserve the current status badge, total, limit,
and tabular number styling.

- [ ] **Step 4: Orchestrate selection in AccountsView**

Maintain:

```ts
const [editingAccount, setEditingAccount] = useState<Account>();
const [editingCard, setEditingCard] = useState<CreditCard>();
const [deleting, setDeleting] = useState<
  { kind: "account"; value: Account } |
  { kind: "card"; value: CreditCard }
>();
```

Creation clears the corresponding edit selection. Successful deletion closes
the dialog; rejected deletion leaves it open so the mapped 409 toast remains
actionable.

- [ ] **Step 5: Run static and production checks**

Run:

```powershell
npm run typecheck
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit management actions**

```powershell
git add src/features/accounts/components
git commit -m "feat: add account and card actions"
```

### Task 4: Build the invoice detail from transaction data

**Files:**
- Create: `src/features/accounts/components/invoice-detail-sheet.tsx`
- Modify: `src/features/accounts/components/accounts-view.tsx`
- Modify: `src/features/accounts/components/credit-card-item.tsx`
- Modify: `src/features/transactions/hooks/use-transaction-mutations.ts`
- Modify: `src/features/transactions/components/transactions-table.tsx`

**Interfaces:**
- Consumes:

```ts
useInvoiceQuery(cardId: string, month: string, enabled)
useTransactionsInfiniteQuery({
  creditCardId,
  type: "EXPENSE",
  basis: "cash",
  from,
  to,
  limit: 50,
}, enabled)
TransactionFormSheet
useDeleteTransaction
EditScopeDialog
```

- Produces:

```ts
interface InvoiceDetailSheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  card?: CreditCard;
  month: string;
}
```

- [ ] **Step 1: Remove the floating-point inline editor**

Delete `editingCell`, `draftAmount`, `commitAmount`, and the `parseFloat` path
from `TransactionsTable`. A click on the amount remains a normal display;
`Editar` continues to open `TransactionFormSheet`, which uses
`parseMoneyInput` and already asks installment scope.

- [ ] **Step 2: Ensure transaction changes refresh invoice caches**

In `invalidateAfterMutation` add:

```ts
void queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
```

Apply the same invalidation after delete and update, so the invoice total and
items refresh together.

- [ ] **Step 3: Implement invoice queries and states**

Inside `InvoiceDetailSheet`, derive `from`/`to` with `monthRangeUTC(month)`.
Enable queries only when `open && card`. Render:

- skeletons while either total or items load;
- `ErrorState` with retry when either query fails;
- `EmptyState` saying “Nenhuma compra nesta fatura.”;
- header with card name, `monthLabel(month)`, status badge, and
  `formatMoney(invoice.totalCents)`;
- a list with description, `dayLabel(settledAt ?? occurredAt)`, installment
  label, and tabular `MoneyText`.

- [ ] **Step 4: Add item edit and delete actions**

`Editar` sets a selected transaction and opens `TransactionFormSheet`.
`Excluir` immediately deletes a simple transaction; for an installment it opens
`EditScopeDialog` and passes the chosen `one|future|all`.

Keep the invoice sheet mounted behind the transaction sheet so the refreshed
total is visible after editing closes.

- [ ] **Step 5: Wire invoice selection from AccountsView**

Store `invoiceCard?: CreditCard` and the current month key. Pass
`onOpenInvoice` into every `CreditCardItem` and render one
`InvoiceDetailSheet`.

- [ ] **Step 6: Run full web verification**

Run:

```powershell
npm run typecheck
npm run lint
npm run build
git diff --check
```

Expected: PASS with no `parseFloat` in
`src/features/transactions/components/transactions-table.tsx`.

- [ ] **Step 7: Commit invoice management**

```powershell
git add src/features/accounts src/features/transactions
git commit -m "feat: manage credit card invoice items"
```

## Final Review Gate

- Confirm editing and deletion use only `/api/proxy/*`.
- Confirm 409 codes show actionable copy and rejected deletes keep the item visible.
- Confirm account/card edit sheets preserve entered values on error.
- Confirm invoice items are filtered by `creditCardId`, `basis=cash`, and the selected São Paulo month.
- Confirm installment edit and delete always ask scope.
- Confirm `rg -n "parseFloat|toFixed" src/features/accounts src/features/transactions` returns no monetary calculation path.
- Confirm `npm run typecheck`, `npm run lint`, and `npm run build` all pass.
