
// Hook responsável pela gestão das transações financeiras.
// Carrega, cria, edita e exclui transações, controla o formulário,
// gere os estados das operações e calcula receitas, despesas e saldo.

"use client";

import { useCallback, useEffect, useState } from "react";

import type { FormEvent } from "react";

import { useRouter } from "next/navigation";

import {
  API_URL,
  getApiError,
  sortTransactions,
} from "@/lib/finance";

import type {
  Transaction,
  TransactionType,
  User,
} from "@/lib/finance";

interface UseTransactionsProps {
  user: User | null;
  setError: (message: string) => void;
  setMessage: (message: string) => void;
}

export default function useTransactions({
  user,
  setError,
  setMessage,
}: UseTransactionsProps) {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] =
    useState<string | null>(null);
  const [editingTransactionId, setEditingTransactionId] =
    useState<string | null>(null);

  const [transactionType, setTransactionType] =
    useState<TransactionType>("EXPENSE");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  const isEditing = editingTransactionId !== null;

  const resetTransactionForm = useCallback(() => {
    setEditingTransactionId(null);
    setTransactionType("EXPENSE");
    setTransactionDescription("");
    setTransactionAmount("");
    setTransactionDate("");
  }, []);

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true);

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        throw new Error(getApiError(data));
      }

      if (!Array.isArray(data)) {
        throw new Error("A API retornou uma lista de transações inválida.");
      }

      setTransactions(sortTransactions(data as Transaction[]));
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as transações.",
      );
    } finally {
      setTransactionsLoading(false);
    }
  }, [router, setError]);

  useEffect(() => {
    if (user) {
      void loadTransactions();
    }
  }, [user, loadTransactions]);

  function handleEdit(transaction: Transaction) {
    setEditingTransactionId(transaction.id);
    setTransactionType(transaction.type);
    setTransactionDescription(transaction.description);
    setTransactionAmount(String(transaction.amount));
    setTransactionDate(
      new Date(transaction.date).toISOString().slice(0, 10),
    );

    setError("");
    setMessage("");

    window.setTimeout(() => {
      document.getElementById("transaction-form-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function handleCancelEdit() {
    resetTransactionForm();
    setError("");
    setMessage("");
  }

  async function handleTransactionSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSavingTransaction(true);
    setError("");
    setMessage("");

    const amount = Number(transactionAmount);
    const description = transactionDescription.trim();

    if (!description) {
      setError("Informe a descrição da transação.");
      setSavingTransaction(false);
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Informe um valor maior que zero.");
      setSavingTransaction(false);
      return;
    }

    try {
      const payload = {
        type: transactionType,
        description,
        amount,
        ...(transactionDate
          ? {
              date: new Date(
                `${transactionDate}T12:00:00`,
              ).toISOString(),
            }
          : {}),
      };

      const response = await fetch(
        isEditing
          ? `${API_URL}/transactions/${editingTransactionId}`
          : `${API_URL}/transactions`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        throw new Error(getApiError(data));
      }

      if (isEditing) {
        setTransactions((current) =>
          sortTransactions(
            current.map((transaction) =>
              transaction.id === data.id
                ? (data as Transaction)
                : transaction,
            ),
          ),
        );
      } else {
        setTransactions((current) =>
          sortTransactions([data as Transaction, ...current]),
        );
      }

      resetTransactionForm();

      setMessage(
        isEditing
          ? "Transação atualizada com sucesso."
          : "Transação cadastrada com sucesso.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a transação.",
      );
    } finally {
      setSavingTransaction(false);
    }
  }

  async function handleDelete(transaction: Transaction) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a transação "${transaction.description}"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    setDeletingTransactionId(transaction.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/transactions/${transaction.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        throw new Error(getApiError(data));
      }

      setTransactions((current) =>
        current.filter((item) => item.id !== transaction.id),
      );

      if (editingTransactionId === transaction.id) {
        resetTransactionForm();
      }

      setMessage("Transação excluída com sucesso.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir a transação.",
      );
    } finally {
      setDeletingTransactionId(null);
    }
  }

  const incomeTotal = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0,
    );

  const expenseTotal = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0,
    );

  const balance = incomeTotal - expenseTotal;

  function clearTransactions() {
    setTransactions([]);
    resetTransactionForm();
  }

  return {
    transactions,
    transactionsLoading,
    savingTransaction,
    deletingTransactionId,
    editingTransactionId,
    transactionType,
    transactionDescription,
    transactionAmount,
    transactionDate,
    isEditing,
    incomeTotal,
    expenseTotal,
    balance,
    setTransactionType,
    setTransactionDescription,
    setTransactionAmount,
    setTransactionDate,
    resetTransactionForm,
    loadTransactions,
    handleEdit,
    handleCancelEdit,
    handleTransactionSubmit,
    handleDelete,
    clearTransactions,
  };
}
