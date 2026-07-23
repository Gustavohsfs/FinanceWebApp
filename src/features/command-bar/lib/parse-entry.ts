import { parseMoneyInput } from "@/core/format/money";
import type { Category, PaymentMethod } from "@/core/api/types";

export interface ParsedEntry {
  amountCents: number | null;
  description: string;
  categoryId?: string;
  categoryName?: string;
  paymentMethod?: PaymentMethod;
  installments: number;
  raw: string;
}

const PAYMENT_KEYWORDS: { pattern: RegExp; method: PaymentMethod }[] = [
  { pattern: /\bpix\b/i, method: "PIX" },
  { pattern: /\bd[ée]bito\b/i, method: "DEBIT" },
  { pattern: /\bcr[ée]dito\b/i, method: "CREDIT" },
  { pattern: /\bdinheiro\b|\bcash\b/i, method: "CASH" },
];

const INSTALLMENTS_PATTERN = /\b(\d{1,2})x\b/i;
const AMOUNT_PATTERN = /\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?/;

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function bestCategoryMatch(
  remainingWords: string[],
  categories: readonly Category[],
): { category: Category; matchedWord: string } | null {
  let best: { category: Category; matchedWord: string; score: number } | null = null;

  for (const word of remainingWords) {
    const normalizedWord = normalize(word);
    if (normalizedWord.length < 2) continue;

    for (const category of categories) {
      const normalizedName = normalize(category.name);
      let score = 0;
      if (normalizedName === normalizedWord) score = 100;
      else if (normalizedName.startsWith(normalizedWord) || normalizedWord.startsWith(normalizedName)) {
        score = 60 + Math.min(normalizedName.length, normalizedWord.length);
      } else if (normalizedName.includes(normalizedWord)) {
        score = 30 + normalizedWord.length;
      }
      if (score > 0 && (!best || score > best.score)) {
        best = { category, matchedWord: word, score };
      }
    }
  }

  return best ? { category: best.category, matchedWord: best.matchedWord } : null;
}

/**
 * Parser puro da command bar (BRIEF §6.3). Ordem de resolução: valor → parcela
 * → método de pagamento → categoria → descrição. O que não é reconhecido vira
 * descrição.
 */
export function parseEntry(input: string, categories: readonly Category[]): ParsedEntry {
  let remaining = input;

  const installmentsMatch = remaining.match(INSTALLMENTS_PATTERN);
  const installments = installmentsMatch?.[1] ? Math.min(24, Math.max(1, parseInt(installmentsMatch[1], 10))) : 1;
  if (installmentsMatch) {
    remaining = remaining.replace(installmentsMatch[0], " ");
  }

  let paymentMethod: PaymentMethod | undefined;
  for (const { pattern, method } of PAYMENT_KEYWORDS) {
    const match = remaining.match(pattern);
    if (match) {
      paymentMethod = method;
      remaining = remaining.replace(match[0], " ");
      break;
    }
  }

  const amountMatch = remaining.match(AMOUNT_PATTERN);
  const amountCents = amountMatch ? parseMoneyInput(amountMatch[0]) : null;
  if (amountMatch) {
    remaining = remaining.replace(amountMatch[0], " ");
  }

  const words = remaining
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const match = bestCategoryMatch(words, categories);
  const description = match
    ? words.filter((word) => word !== match.matchedWord).join(" ")
    : words.join(" ");

  return {
    amountCents,
    description: description.trim(),
    ...(match ? { categoryId: match.category.id, categoryName: match.category.name } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    installments,
    raw: input,
  };
}
