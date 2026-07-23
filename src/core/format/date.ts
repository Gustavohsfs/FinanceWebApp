import { addMonths } from "date-fns";

/**
 * Fuso de agregação: America/Sao_Paulo. Brasil não tem horário de verão desde
 * 2019, então o offset é fixo (UTC-3) e a conversão é aritmética pura —
 * mesma abordagem usada no mobile, comprovada e determinística.
 */
const SP_OFFSET_MS = 3 * 60 * 60 * 1000;

const MESES_CURTOS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
] as const;

const MESES_LONGOS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
] as const;

const pad2 = (n: number) => String(n).padStart(2, "0");

function shiftToSP(iso: string): Date {
  return new Date(new Date(iso).getTime() - SP_OFFSET_MS);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function monthKey(iso: string): string {
  const d = shiftToSP(iso);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
}

export function dayKey(iso: string): string {
  const d = shiftToSP(iso);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export function currentMonthKey(): string {
  return monthKey(nowISO());
}

export function addMonthsToKey(key: string, months: number): string {
  const [y, m] = key.split("-").map(Number);
  const total = (y ?? 1970) * 12 + ((m ?? 1) - 1) + months;
  const newY = Math.floor(total / 12);
  const newM = ((total % 12) + 12) % 12;
  return `${newY}-${pad2(newM + 1)}`;
}

export function addMonthsISO(iso: string, months: number): string {
  return addMonths(new Date(iso), months).toISOString();
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const nome = MESES_LONGOS[((m ?? 1) - 1 + 12) % 12] ?? "";
  return `${nome} de ${y ?? 0}`;
}

export function monthShort(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const nome = MESES_CURTOS[((m ?? 1) - 1 + 12) % 12] ?? "";
  return `${nome}/${String(y ?? 0).slice(2)}`;
}

export function dayLabel(iso: string): string {
  const d = shiftToSP(iso);
  return `${d.getUTCDate()} ${MESES_CURTOS[d.getUTCMonth()]}`;
}

/** "YYYY-MM-DD" -> "23 jul", sem depender de fuso (a chave já é o dia local). */
export function dayShortLabelFromKey(day: string): string {
  const [, month, dayOfMonth] = day.split("-");
  const monthIndex = (Number(month ?? 1) - 1 + 12) % 12;
  return `${Number(dayOfMonth ?? 1)} ${MESES_CURTOS[monthIndex]}`;
}

export function lastNMonthKeys(refKey: string, n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(addMonthsToKey(refKey, -i));
  }
  return keys;
}

/** Intervalo [from, to) de um mês em ISO UTC, bordas na meia-noite de SP. */
export function monthRangeUTC(key: string): { from: string; to: string } {
  const [y, m] = key.split("-").map(Number);
  const from = Date.UTC(y ?? 1970, (m ?? 1) - 1, 1) + SP_OFFSET_MS;
  const to = Date.UTC(y ?? 1970, m ?? 1, 1) + SP_OFFSET_MS;
  return { from: new Date(from).toISOString(), to: new Date(to).toISOString() };
}

export function formatDateInput(iso: string): string {
  const d = shiftToSP(iso);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

/** ISO (UTC) -> "YYYY-MM-DDTHH:mm" no fuso de SP, para popular <input type="datetime-local">. */
export function formatDateTimeLocal(iso: string): string {
  const d = shiftToSP(iso);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

/** "YYYY-MM-DDTHH:mm" (interpretado como horário de SP) -> ISO com offset -03:00. */
export function toSPOffsetISOString(dateTimeLocal: string): string {
  return `${dateTimeLocal}:00-03:00`;
}
