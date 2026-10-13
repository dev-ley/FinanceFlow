"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionList from "@/components/transactions/TransactionList";

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

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

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

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (!cancelled) {
            router.replace("/login");
          }
          return;
        }

        const data = (await response.json()) as User;

        if (!cancelled) {
          setUser(data);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Não foi possível conectar à API. Confirme se o backend está ligado.",
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

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

  async function handleLogout() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Não foi possível encerrar a sessão.");
      }

      setUser(null);
      setTransactions([]);
      resetTransactionForm();

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível encerrar a sessão.",
      );
    } finally {
      setLoading(false);
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

  if (checkingSession) {
    return (
      <main className="page-shell">
        <div className="loading-card">
          <span className="brand-mark">F</span>
          <p>Preparando seu FinanceFlow...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page-shell">
        <div className="loading-card">
          <span className="brand-mark">F</span>
          <p>Redirecionando para o login...</p>
          <Link href="/login">Ir para o login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell dashboard-page">
      <section className="dashboard-card dashboard-content">
        <DashboardHeader
          userName={user.name || user.email}
          loading={loading}
          onLogout={() => void handleLogout()}
        />

        <div className="dashboard-intro">
          <p className="eyebrow">VISÃO GERAL</p>
          <h1>Seu painel financeiro</h1>
          <p className="subtitle">
            Acompanhe suas receitas, despesas e saldo em um só lugar.
          </p>
        </div>

        {error && (
          <div className="feedback error dashboard-feedback" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="feedback success dashboard-feedback" role="status">
            {message}
          </div>
        )}

        <SummaryCards
          balance={balance}
          incomeTotal={incomeTotal}
          expenseTotal={expenseTotal}
        />

        <div className="dashboard-transactions">
          <TransactionForm
            isEditing={isEditing}
            transactionType={transactionType}
            transactionDescription={transactionDescription}
            transactionAmount={transactionAmount}
            transactionDate={transactionDate}
            savingTransaction={savingTransaction}
            onTypeChange={setTransactionType}
            onDescriptionChange={setTransactionDescription}
            onAmountChange={setTransactionAmount}
            onDateChange={setTransactionDate}
            onSubmit={handleTransactionSubmit}
            onCancelEdit={handleCancelEdit}
          />

          <TransactionList
            transactions={transactions}
            transactionsLoading={transactionsLoading}
            deletingTransactionId={deletingTransactionId}
            editingTransactionId={editingTransactionId}
            savingTransaction={savingTransaction}
            onRefresh={() => void loadTransactions()}
            onEdit={handleEdit}
            onDelete={(transaction) => void handleDelete(transaction)}
          />
        </div>

        <p className="security-note dashboard-security-note">
          <span className="status-dot" />
          Seus dados são carregados pela API com autenticação por cookie
          HttpOnly.
        </p>
      </section>
    </main>
  );
}
