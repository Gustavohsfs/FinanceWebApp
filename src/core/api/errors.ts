export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  code: string;
  detail: string;
  instance: string;
  traceId: string;
  errors?: { field: string; message: string }[];
}

const MESSAGES: Record<string, string> = {
  AUTH_EMAIL_ALREADY_EXISTS: "Este e-mail já está cadastrado.",
  AUTH_INVALID_CREDENTIALS: "E-mail ou senha incorretos.",
  AUTH_INVALID_TOKEN: "Sessão expirada. Entre novamente.",
  AUTH_REFRESH_REUSED: "Sessão inválida. Entre novamente.",
  AUTH_REFRESH_REVOKED: "Sessão encerrada. Entre novamente.",
  AUTH_RESET_TOKEN_INVALID: "Link de redefinição inválido ou expirado.",
  RESOURCE_NOT_FOUND: "Registro não encontrado.",
  VALIDATION_FAILED: "Alguns campos precisam de ajuste.",
  PAGINATION_INVALID_CURSOR:
    "Não foi possível continuar a lista. Recarregue a página.",
  IDEMPOTENCY_KEY_REQUIRED: "Requisição inválida. Tente novamente.",
  IDEMPOTENCY_KEY_REUSED: "Essa ação já foi registrada.",
  TRANSACTION_INVALID_INSTALLMENTS: "Parcelamento exige pagamento no crédito.",
  TRANSACTION_INVALID_PAYMENT_METHOD:
    "Método de pagamento inválido para esta transação.",
  TRANSACTION_INVALID_SCOPE: "Escopo de edição inválido para esta parcela.",
  FINANCIAL_RELATION_INVALID:
    "Conta ou cartão informado não pertence a este usuário.",
  ACCOUNT_LAST_ACTIVE: "Crie outra conta antes de excluir esta.",
  ACCOUNT_HAS_ACTIVE_CARDS:
    "Exclua ou mova os cartões desta conta antes de continuar.",
  ACCOUNT_HAS_ACTIVE_RECURRENCES:
    "Remova as recorrências desta conta antes de continuar.",
  CREDIT_CARD_HAS_ACTIVE_RECURRENCES:
    "Remova as recorrências deste cartão antes de continuar.",
  INTERNAL_ERROR: "Não foi possível concluir a operação. Tente novamente.",
  UNKNOWN: "Algo deu errado. Tente novamente.",
  NETWORK_ERROR: "Não foi possível conectar ao servidor.",
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: { field: string; message: string }[];

  constructor(problem: {
    status: number;
    code: string;
    detail?: string;
    errors?: { field: string; message: string }[];
  }) {
    super(MESSAGES[problem.code] ?? problem.detail ?? MESSAGES.UNKNOWN);
    this.name = "ApiRequestError";
    this.status = problem.status;
    this.code = problem.code;
    this.fieldErrors = problem.errors;
  }
}

export async function toApiRequestError(
  response: Response,
): Promise<ApiRequestError> {
  try {
    const problem = (await response.json()) as Partial<ProblemDetails>;
    return new ApiRequestError({
      status: response.status,
      code: problem.code ?? "UNKNOWN",
      detail: problem.detail ?? problem.title,
      errors: problem.errors,
    });
  } catch {
    return new ApiRequestError({ status: response.status, code: "UNKNOWN" });
  }
}
