"use client";

import type { Transaction } from "@/lib/finance";
import { formatCurrency, formatDate } from "@/lib/finance";
import "./TransactionList.css";

type TransactionListProps = {
  transactions: Transaction[];
  transactionsLoading: boolean;
  deletingTransactionId: string | null;
  editingTransactionId: string | null;
  savingTransaction: boolean;
  onRefresh: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export default function TransactionList({
  transactions,
  transactionsLoading,
  deletingTransactionId,
  editingTransactionId,
  savingTransaction,
  onRefresh,
  onEdit,
  onDelete,
}: TransactionListProps) {
  return (
    <section className="transaction-panel transaction-list-panel">
      <div className="transaction-list-header">
        <h2>Transações</h2>

        <button
          className="transaction-refresh-button"
          type="button"
          onClick={onRefresh}
          disabled={transactionsLoading}
        >
          {transactionsLoading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <p className="transaction-list-count">
        {transactions.length === 1
          ? "1 transação registrada"
          : `${transactions.length} transações registradas`}
      </p>

      {transactionsLoading && transactions.length === 0 ? (
        <p className="transaction-list-loading" role="status">
          Carregando transações...
        </p>
      ) : transactions.length === 0 ? (
        <div className="transaction-empty-state">
          <p className="transaction-empty-title">
            Nenhuma transação ainda
          </p>

          <p className="transaction-empty-description">
            Cadastre sua primeira receita ou despesa no formulário.
          </p>
        </div>
      ) : (
        <div className="transaction-items">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === "INCOME";
            const isDeleting = deletingTransactionId === transaction.id;
            const isCurrentEditing =
              editingTransactionId === transaction.id;

            return (
              <article
                key={transaction.id}
                className={[
                  "transaction-item",
                  isCurrentEditing ? "is-editing" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="transaction-item-main">
                  <div className="transaction-item-details">
                    <span
                      aria-hidden="true"
                      className={`transaction-type-icon ${
                        isIncome ? "is-income" : "is-expense"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                    </span>

                    <div className="transaction-item-copy">
                      <p className="transaction-item-description">
                        {transaction.description}
                      </p>

                      <p className="transaction-item-meta">
                        {isIncome ? "Receita" : "Despesa"} ·{" "}
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>

                  <strong
                    className={`transaction-item-amount ${
                      isIncome ? "is-income" : "is-expense"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {formatCurrency(Number(transaction.amount))}
                  </strong>
                </div>

                <div className="transaction-item-actions">
                  <button
                    className={`transaction-action-button transaction-edit-button ${
                      isCurrentEditing ? "is-active" : ""
                    }`}
                    type="button"
                    onClick={() => onEdit(transaction)}
                    disabled={
                      savingTransaction ||
                      deletingTransactionId !== null
                    }
                  >
                    {isCurrentEditing ? "Editando..." : "Editar"}
                  </button>

                  <button
                    className="transaction-action-button transaction-delete-button"
                    type="button"
                    onClick={() => onDelete(transaction)}
                    disabled={
                      isDeleting ||
                      deletingTransactionId !== null ||
                      savingTransaction
                    }
                  >
                    {isDeleting ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}