"use client";

import type { FormEvent } from "react";
import type { TransactionType } from "@/lib/finance";
import "./TransactionForm.css";

type TransactionFormProps = {
  isEditing: boolean;
  transactionType: TransactionType;
  transactionDescription: string;
  transactionAmount: string;
  transactionDate: string;
  savingTransaction: boolean;
  onTypeChange: (type: TransactionType) => void;
  onDescriptionChange: (description: string) => void;
  onAmountChange: (amount: string) => void;
  onDateChange: (date: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
};

export default function TransactionForm({
  isEditing,
  transactionType,
  transactionDescription,
  transactionAmount,
  transactionDate,
  savingTransaction,
  onTypeChange,
  onDescriptionChange,
  onAmountChange,
  onDateChange,
  onSubmit,
  onCancelEdit,
}: TransactionFormProps) {
  return (
    <section
      id="transaction-form-panel"
      className={`transaction-panel${isEditing ? " is-editing" : ""}`}
      aria-label={isEditing ? "Editando transação" : "Nova transação"}
    >
      <div className="transaction-panel-header">
        <h2>
          {isEditing ? "Editar transação" : "Nova transação"}
        </h2>

        <p>
          {isEditing
            ? "Altere os dados e salve as modificações."
            : "Registre uma receita ou uma despesa."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="auth-form">
        <div className="field">
          <label htmlFor="transactionType">Tipo de transação</label>

          <select
            id="transactionType"
            className="form-control"
            value={transactionType}
            onChange={(event) =>
              onTypeChange(event.target.value as TransactionType)
            }
          >
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="transactionDescription">Descrição</label>

          <input
            id="transactionDescription"
            type="text"
            placeholder="Ex.: Salário, mercado, internet..."
            value={transactionDescription}
            onChange={(event) =>
              onDescriptionChange(event.target.value)
            }
            minLength={1}
            maxLength={150}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="transactionAmount">Valor (R$)</label>

          <input
            id="transactionAmount"
            type="number"
            placeholder="0,00"
            value={transactionAmount}
            onChange={(event) => onAmountChange(event.target.value)}
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="transactionDate">Data</label>

          <input
            id="transactionDate"
            type="date"
            value={transactionDate}
            onChange={(event) => onDateChange(event.target.value)}
          />

          <span className="field-hint">
            {isEditing
              ? "Se não alterar a data, ela será mantida."
              : "Se deixar em branco, será usada a data atual."}
          </span>
        </div>

        <button
          className="primary-button"
          type="submit"
          disabled={savingTransaction}
        >
          {savingTransaction
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Cadastrar transação"}
        </button>

        {isEditing && (
          <button
            className="secondary-button transaction-cancel-button"
            type="button"
            disabled={savingTransaction}
            onClick={onCancelEdit}
          >
            Cancelar edição
          </button>
        )}
      </form>
    </section>
  );
}