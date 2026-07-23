/**
 * Dinheiro é inteiro em centavos. Nunca float em cálculo monetário.
 * Formatação só acontece aqui — nenhum `toLocaleString` solto pelo código.
 */
export type Cents = number;

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(cents: Cents): string {
  return brlFormatter.format(cents / 100);
}

export function formatMoneyCompact(cents: Cents): string {
  return numberFormatter.format(cents / 100);
}

export function formatMoneySigned(cents: Cents): string {
  const sign = cents > 0 ? "+" : cents < 0 ? "−" : "";
  return `${sign}${formatMoney(Math.abs(cents))}`;
}

/**
 * Converte texto digitado (ex.: "1.234,56", "45,90", "12") em centavos inteiros.
 * Usado pelo input de valor e pelo parser da command bar.
 */
export function parseMoneyInput(input: string): Cents {
  const trimmed = input.trim();
  if (trimmed === "") return 0;

  let cleaned = trimmed.replace(/[^0-9.,-]/g, "");
  const negative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalSep = lastComma > lastDot ? "," : lastDot > lastComma ? "." : "";

  let intPart = cleaned;
  let fracPart = "";
  if (decimalSep) {
    const idx = cleaned.lastIndexOf(decimalSep);
    intPart = cleaned.slice(0, idx);
    fracPart = cleaned.slice(idx + 1);
  }

  intPart = intPart.replace(/[.,]/g, "");
  fracPart = fracPart.replace(/[.,]/g, "");
  fracPart = (fracPart + "00").slice(0, 2);

  const reais = intPart === "" ? 0 : parseInt(intPart, 10);
  const centavos = fracPart === "" ? 0 : parseInt(fracPart, 10);
  if (Number.isNaN(reais) || Number.isNaN(centavos)) return 0;

  const total = reais * 100 + centavos;
  return negative ? -total : total;
}

/** Divide um total em N parcelas inteiras cuja soma fecha exatamente com o total. */
export function splitInstallments(total: Cents, n: number): Cents[] {
  if (!Number.isInteger(n) || n <= 0) throw new Error(`número de parcelas inválido: ${n}`);
  const sign = total < 0 ? -1 : 1;
  const absTotal = Math.abs(total);
  const base = Math.floor(absTotal / n);
  const remainder = absTotal - base * n;
  const parts: Cents[] = [];
  for (let i = 0; i < n; i++) {
    const extra = i < remainder ? 1 : 0;
    parts.push(sign * (base + extra));
  }
  return parts;
}
