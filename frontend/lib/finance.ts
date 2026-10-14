
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

export const API_URL = (
  configuredApiUrl || "http://localhost:3000"
).replace(/\/+$/, "");

export interface User {
  userId?: string;
  id?: string;
  name?: string;
  email: string;
}

export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: string | number;
  date: string;
  createdAt: string;
}

export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

export function getApiError(
  data: { message?: string | string[] } | null,
): string {
  const apiMessage = data?.message;

  return Array.isArray(apiMessage)
    ? apiMessage.join(" ")
    : apiMessage || "Não foi possível concluir a operação.";
}

export function sortTransactions(
  transactions: Transaction[],
): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
