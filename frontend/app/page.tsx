"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

const API_URL = "http://localhost:3000";

interface User {
  userId?: string;
  id?: string;
  name?: string;
  email: string;
}

type TransactionType = "INCOME" | "EXPENSE";

interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: string | number;
  date: string;
  createdAt: string;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

function getApiError(data: { message?: string | string[] } | null) {
  const apiMessage = data?.message;

  return Array.isArray(apiMessage)
    ? apiMessage.join(" ")
    : apiMessage || "Não foi possível concluir a operação.";
}

function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export default function Home() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);

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
        throw new Error(
          response.status === 401
            ? "Sua sessão expirou. Entre novamente."
            : getApiError(data),
        );
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();

          if (!cancelled) {
            setUser(data);
          }
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
  }, []);

  useEffect(() => {
    if (user) {
      void loadTransactions();
    } else {
      setTransactions([]);
    }
  }, [user, loadTransactions]);

  function changeMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setMessage("");
    setError("");
    setPassword("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const endpoint =
        mode === "register" ? "/auth/register" : "/auth/login";

      const payload =
        mode === "register"
          ? { name: name.trim(), email: email.trim(), password }
          : { email: email.trim(), password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getApiError(data));
      }

      if (mode === "register") {
        setMessage("Conta criada! Agora entre com seu e-mail e senha.");
        setMode("login");
        setPassword("");
        return;
      }

      const sessionResponse = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });

      if (!sessionResponse.ok) {
        throw new Error(
          "Login realizado, mas não foi possível confirmar a sessão.",
        );
      }

      const sessionData = await sessionResponse.json();

      setUser(sessionData);
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro inesperado.",
      );
    } finally {
      setLoading(false);
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
      setMode("login");
      setPassword("");
      setMessage("Você saiu da sua conta com segurança.");
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

  function handleEdit(transaction: Transaction) {
    setEditingTransactionId(transaction.id);
    setTransactionType(transaction.type);
    setTransactionDescription(transaction.description);
    setTransactionAmount(String(transaction.amount));
    setTransactionDate(new Date(transaction.date).toISOString().slice(0, 10));
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
        throw new Error(
          response.status === 401
            ? "Sua sessão expirou. Entre novamente."
            : getApiError(data),
        );
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

    if (!confirmed) {
      return;
    }

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
        throw new Error(
          response.status === 401
            ? "Sua sessão expirou. Entre novamente."
            : getApiError(data),
        );
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

  if (user) {
    return (
      <main
        className="page-shell"
        style={{
          display: "block",
          width: "100%",
          maxWidth: "none",
          padding: "28px",
        }}
      >
        <section
          className="dashboard-card"
          style={{
            width: "100%",
            maxWidth: "1100px",
            padding: "clamp(22px, 4vw, 42px)",
          }}
        >
          <header
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "18px",
              marginBottom: "36px",
            }}
          >
            <div className="brand">
              <span className="brand-mark">F</span>
              <span>FinanceFlow</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  color: "#718096",
                  fontSize: "12px",
                }}
              >
                {user.name || user.email}
              </span>

              <button
                className="secondary-button"
                style={{
                  width: "auto",
                  minHeight: "40px",
                  marginTop: 0,
                  padding: "9px 16px",
                }}
                type="button"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? "Saindo..." : "Sair da conta"}
              </button>
            </div>
          </header>

          <div style={{ marginBottom: "30px" }}>
            <p className="eyebrow">VISÃO GERAL</p>
            <h1
              style={{
                margin: 0,
                color: "#17242e",
                fontSize: "clamp(27px, 4vw, 36px)",
                letterSpacing: "-1.4px",
              }}
            >
              Seu painel financeiro
            </h1>
            <p className="subtitle">
              Acompanhe suas receitas, despesas e saldo em um só lugar.
            </p>
          </div>

          {error && (
            <div
              className="feedback error"
              role="alert"
              style={{ marginBottom: "18px" }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className="feedback success"
              role="status"
              style={{ marginBottom: "18px" }}
            >
              {message}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "16px",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                padding: "22px",
                border: "1px solid #dcebe3",
                borderRadius: "16px",
                background: "#f0f8f3",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px",
                  color: "#527260",
                  fontSize: "12px",
                  fontWeight: 650,
                }}
              >
                Saldo atual
              </p>
              <strong
                style={{
                  color: balance >= 0 ? "#176b49" : "#b93832",
                  fontSize: "clamp(22px, 3vw, 29px)",
                  overflowWrap: "anywhere",
                }}
              >
                {formatCurrency(balance)}
              </strong>
            </div>

            <div
              style={{
                padding: "22px",
                border: "1px solid #dcebe3",
                borderRadius: "16px",
                background: "#ffffff",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px",
                  color: "#718096",
                  fontSize: "12px",
                  fontWeight: 650,
                }}
              >
                Total de receitas
              </p>
              <strong
                style={{
                  color: "#176b49",
                  fontSize: "clamp(21px, 3vw, 27px)",
                  overflowWrap: "anywhere",
                }}
              >
                {formatCurrency(incomeTotal)}
              </strong>
            </div>

            <div
              style={{
                padding: "22px",
                border: "1px solid #eee1df",
                borderRadius: "16px",
                background: "#fffafa",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px",
                  color: "#718096",
                  fontSize: "12px",
                  fontWeight: 650,
                }}
              >
                Total de despesas
              </p>
              <strong
                style={{
                  color: "#b93832",
                  fontSize: "clamp(21px, 3vw, 27px)",
                  overflowWrap: "anywhere",
                }}
              >
                {formatCurrency(expenseTotal)}
              </strong>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: "28px",
              alignItems: "start",
            }}
          >
            <section
              id="transaction-form-panel"
              aria-label={isEditing ? "Editando transação" : "Nova transação"}
              style={{
                padding: "24px",
                border: isEditing
                  ? "2px solid #7567f8"
                  : "1px solid #e4eaf1",
                borderRadius: "16px",
                background: isEditing ? "#faf9ff" : "#ffffff",
                boxShadow: isEditing
                  ? "0 0 0 4px rgba(117, 103, 248, 0.12), 0 12px 28px rgba(76, 61, 180, 0.08)"
                  : "none",
                transition:
                  "border-color 180ms ease, background 180ms ease, box-shadow 180ms ease",
                scrollMarginTop: "24px",
                minWidth: 0,
              }}
            >
              {isEditing && (
                <div
                  role="status"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px",
                    padding: "12px 14px",
                    border: "1px solid #d9d4ff",
                    borderRadius: "12px",
                    background: "#eeebff",
                    color: "#5141b5",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: "grid",
                      width: "34px",
                      height: "34px",
                      flex: "0 0 34px",
                      placeItems: "center",
                      borderRadius: "10px",
                      background: "#dcd6ff",
                      fontSize: "17px",
                    }}
                  >
                    ✎
                  </span>
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      MODO DE EDIÇÃO ATIVO
                    </strong>
                    <span
                      style={{
                        display: "block",
                        marginTop: "3px",
                        fontSize: "11px",
                        lineHeight: 1.5,
                      }}
                    >
                      Você está alterando uma transação existente.
                    </span>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "22px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: "0 0 8px",
                      color: isEditing ? "#43349f" : "#17242e",
                      fontSize: "19px",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {isEditing ? "Editar transação" : "Nova transação"}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: "#718096",
                      fontSize: "12px",
                      lineHeight: 1.7,
                    }}
                  >
                    {isEditing
                      ? "Altere os dados e salve as modificações."
                      : "Registre uma receita ou uma despesa."}
                  </p>
                </div>

                {isEditing && (
                  <span
                    style={{
                      flex: "0 0 auto",
                      padding: "6px 9px",
                      borderRadius: "7px",
                      background: "#7567f8",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.4px",
                    }}
                  >
                    EDITANDO
                  </span>
                )}
              </div>

              <form
                onSubmit={handleTransactionSubmit}
                className="auth-form"
              >
                <div className="field">
                  <label htmlFor="transactionType">
                    Tipo de transação
                  </label>
                  <select
                    id="transactionType"
                    value={transactionType}
                    onChange={(event) =>
                      setTransactionType(
                        event.target.value as TransactionType,
                      )
                    }
                    style={{
                      width: "100%",
                      height: "49px",
                      padding: "0 12px",
                      border: "1px solid #dce4eb",
                      borderRadius: "10px",
                      background: "#fff",
                      color: "#182230",
                    }}
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
                      setTransactionDescription(event.target.value)
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
                    onChange={(event) =>
                      setTransactionAmount(event.target.value)
                    }
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
                    onChange={(event) =>
                      setTransactionDate(event.target.value)
                    }
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
                    className="secondary-button"
                    type="button"
                    disabled={savingTransaction}
                    onClick={handleCancelEdit}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      marginTop: "10px",
                      border: "1px solid #d9d4ff",
                      borderRadius: "10px",
                      background: "#ffffff",
                      color: "#5141b5",
                      fontWeight: 700,
                    }}
                  >
                    ← Cancelar edição
                  </button>
                )}
              </form>
            </section>

            <section
              style={{
                padding: "24px",
                border: "1px solid #e4eaf1",
                borderRadius: "16px",
                background: "#ffffff",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "19px",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Transações
                </h2>

                <button
                  type="button"
                  onClick={() => void loadTransactions()}
                  disabled={transactionsLoading}
                  style={{
                    padding: "7px 10px",
                    border: "1px solid #e4eaf1",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#176b58",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: transactionsLoading ? "wait" : "pointer",
                  }}
                >
                  {transactionsLoading ? "Atualizando..." : "Atualizar"}
                </button>
              </div>

              <p
                style={{
                  margin: "0 0 22px",
                  color: "#718096",
                  fontSize: "12px",
                  lineHeight: 1.7,
                }}
              >
                {transactions.length === 1
                  ? "1 transação registrada"
                  : `${transactions.length} transações registradas`}
              </p>

              {transactionsLoading && transactions.length === 0 ? (
                <p
                  style={{
                    padding: "24px 0",
                    color: "#718096",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  Carregando transações...
                </p>
              ) : transactions.length === 0 ? (
                <div
                  style={{
                    padding: "30px 14px",
                    border: "1px dashed #dce4eb",
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#344353",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    Nenhuma transação ainda
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: "#718096",
                      fontSize: "12px",
                      lineHeight: 1.7,
                    }}
                  >
                    Cadastre sua primeira receita ou despesa no formulário.
                  </p>
                </div>
              ) : (
                <div>
                  {transactions.map((transaction) => {
                    const isIncome = transaction.type === "INCOME";
                    const isDeleting =
                      deletingTransactionId === transaction.id;
                    const isCurrentEditing =
                      editingTransactionId === transaction.id;

                    return (
                      <article
                        key={transaction.id}
                        style={{
                          padding: "16px 12px",
                          margin: "0 -12px",
                          borderBottom: "1px solid #edf0f4",
                          borderRadius: isCurrentEditing ? "12px" : "0",
                          border: isCurrentEditing
                            ? "1px solid #d9d4ff"
                            : "1px solid transparent",
                          background: isCurrentEditing
                            ? "#f7f5ff"
                            : "transparent",
                          transition:
                            "background 180ms ease, border-color 180ms ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              minWidth: 0,
                            }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                display: "grid",
                                width: "38px",
                                height: "38px",
                                flex: "0 0 38px",
                                placeItems: "center",
                                borderRadius: "12px",
                                background: isIncome ? "#e7f6ed" : "#fff0ee",
                                color: isIncome ? "#176b49" : "#b93832",
                                fontSize: "19px",
                                fontWeight: 700,
                              }}
                            >
                              {isIncome ? "+" : "−"}
                            </span>

                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  margin: "0 0 5px",
                                  color: "#263442",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {transaction.description}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  color: "#8a96a4",
                                  fontSize: "10px",
                                }}
                              >
                                {isIncome ? "Receita" : "Despesa"} ·{" "}
                                {formatDate(transaction.date)}
                              </p>
                            </div>
                          </div>

                          <strong
                            style={{
                              flex: "0 0 auto",
                              color: isIncome ? "#176b49" : "#b93832",
                              fontSize: "12px",
                              textAlign: "right",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {isIncome ? "+" : "−"}
                            {formatCurrency(Number(transaction.amount))}
                          </strong>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginTop: "12px",
                            paddingLeft: "50px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleEdit(transaction)}
                            disabled={
                              savingTransaction ||
                              deletingTransactionId !== null
                            }
                            style={{
                              padding: "7px 12px",
                              border: isCurrentEditing
                                ? "1px solid #7567f8"
                                : "1px solid #dce4eb",
                              borderRadius: "8px",
                              background: isCurrentEditing
                                ? "#7567f8"
                                : "#fff",
                              color: isCurrentEditing ? "#fff" : "#344353",
                              fontSize: "11px",
                              fontWeight: 650,
                              cursor: "pointer",
                            }}
                          >
                            {isCurrentEditing ? "Editando..." : "Editar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDelete(transaction)}
                            disabled={
                              isDeleting ||
                              deletingTransactionId !== null ||
                              savingTransaction
                            }
                            style={{
                              padding: "7px 12px",
                              border: "1px solid #f0d6d3",
                              borderRadius: "8px",
                              background: "#fffafa",
                              color: "#b93832",
                              fontSize: "11px",
                              fontWeight: 650,
                              cursor: "pointer",
                            }}
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
          </div>

          <p
            className="security-note"
            style={{ marginTop: "30px" }}
          >
            <span className="status-dot" />
            Seus dados são carregados pela API com autenticação por cookie
            HttpOnly.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="auth-card">
        <div className="brand">
          <span className="brand-mark">F</span>
          <span>FinanceFlow</span>
        </div>

        <div className="intro">
          <p className="eyebrow">SUAS FINANÇAS, SOB CONTROLE</p>
          <h1>
            {mode === "login"
              ? "Bom ter você de volta."
              : "Comece sua organização financeira."}
          </h1>
          <p className="subtitle">
            {mode === "login"
              ? "Entre na sua conta para continuar."
              : "Crie sua conta e dê o primeiro passo."}
          </p>
        </div>

        <div className="mode-switch" aria-label="Tipo de acesso">
          <button
            type="button"
            className={mode === "login" ? "mode active" : "mode"}
            onClick={() => changeMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === "register" ? "mode active" : "mode"}
            onClick={() => changeMode("register")}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="field">
              <label htmlFor="name">Nome completo</label>
              <input
                id="name"
                type="text"
                placeholder="Como podemos chamar você?"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder={
                mode === "register"
                  ? "Pelo menos 8 caracteres"
                  : "Digite sua senha"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={mode === "register" ? 8 : 1}
              maxLength={72}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              required
            />
            {mode === "register" && (
              <span className="field-hint">
                Use pelo menos 8 caracteres.
              </span>
            )}
          </div>

          {error && (
            <div className="feedback error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="feedback success" role="status">
              {message}
            </div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar na minha conta"
                : "Criar minha conta"}
            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <div className="divider">
          <span />
          <p>SEGURO E PRIVADO</p>
          <span />
        </div>

        <p className="security-note">
          <span className="status-dot" />
          Sua senha é protegida e a sessão usa cookie HttpOnly.
        </p>

        <p className="switch-copy">
          {mode === "login"
            ? "Ainda não tem conta?"
            : "Já tem uma conta?"}{" "}
          <button
            type="button"
            onClick={() =>
              changeMode(mode === "login" ? "register" : "login")
            }
          >
            {mode === "login" ? "Cadastre-se" : "Entrar"}
          </button>
        </p>
      </section>

      <aside className="visual-panel">
        <div className="visual-content">
          <div className="visual-label">
            <span className="visual-label-dot" />
            VISÃO CLARA DO SEU DINHEIRO
          </div>

          <h2>
            Suas escolhas.
            <br />
            Seus planos.
            <br />
            <span>Seu futuro.</span>
          </h2>

          <p>
            Organize sua vida financeira com mais clareza e tome decisões com
            confiança.
          </p>

          <div className="preview-card">
            <div className="preview-top">
              <span>Resumo financeiro</span>
              <span className="preview-period">DEMONSTRAÇÃO</span>
            </div>
            <div className="preview-label">Controle em um só lugar</div>
            <div className="preview-line">
              <span>Receitas</span>
              <span className="preview-positive">Organizadas</span>
            </div>
            <div className="preview-line">
              <span>Despesas</span>
              <span>Monitoradas</span>
            </div>
            <div className="preview-line">
              <span>Metas</span>
              <span>Planejadas</span>
            </div>
            <div className="preview-bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="visual-footer">
          <span>FINANCEFLOW</span>
          <span>ORGANIZAÇÃO QUE TRANSFORMA</span>
        </div>
      </aside>
    </main>
  );
}