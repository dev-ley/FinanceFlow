
// Componente principal do dashboard do FinanceFlow.
// Organiza a interface, liga os hooks aos componentes e apresenta
// os dados financeiros, os formulários e as mensagens ao utilizador.

"use client";

import Link from "next/link";

import "./DashboardPage.css";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionList from "@/components/transactions/TransactionList";

import useDashboard from "@/hooks/useDashboard";
import useTransactions from "@/hooks/useTransactions";

export default function DashboardPage() {
  const {
    user,
    checkingSession,
    loading,
    message,
    error,
    setMessage,
    setError,
    handleLogout,
  } = useDashboard();

  const {
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
    loadTransactions,
    handleEdit,
    handleCancelEdit,
    handleTransactionSubmit,
    handleDelete,
    clearTransactions,
  } = useTransactions({
    user,
    setError,
    setMessage,
  });

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
          onLogout={() => void handleLogout(clearTransactions)}
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
