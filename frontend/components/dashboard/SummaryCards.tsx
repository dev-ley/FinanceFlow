"use client";

import { formatCurrency } from "@/lib/finance";
import "./SummaryCards.css";

type SummaryCardsProps = {
  balance: number;
  incomeTotal: number;
  expenseTotal: number;
};

type SummaryCardProps = {
  label: string;
  value: number;
  variant: "balance" | "income" | "expense";
};

export default function SummaryCards({
  balance,
  incomeTotal,
  expenseTotal,
}: SummaryCardsProps) {
  return (
    <div className="summary-cards">
      <SummaryCard
        label="Saldo atual"
        value={balance}
        variant="balance"
      />

      <SummaryCard
        label="Total de receitas"
        value={incomeTotal}
        variant="income"
      />

      <SummaryCard
        label="Total de despesas"
        value={expenseTotal}
        variant="expense"
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  variant,
}: SummaryCardProps) {
  const valueClassName = [
    "summary-card-value",
    `is-${variant}`,
    variant === "balance" && value < 0
      ? "is-negative"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={`summary-card is-${variant}`}>
      <p className="summary-card-label">{label}</p>

      <strong className={valueClassName}>
        {formatCurrency(value)}
      </strong>
    </article>
  );
}