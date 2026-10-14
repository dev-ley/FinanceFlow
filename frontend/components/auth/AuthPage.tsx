
/**
 * Componente principal das páginas de login e cadastro.
 * Organiza a estrutura visual da autenticação e liga o hook
 * useAuth aos componentes responsáveis pelo formulário e painel.
 */

"use client";

import Link from "next/link";

import "./AuthPage.css";

import AuthForm from "@/components/auth/AuthForm";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import useAuth from "@/hooks/useAuth";

type AuthPageProps = {
  mode: "login" | "register";
};

export default function AuthPage({ mode }: AuthPageProps) {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    checkingSession,
    message,
    error,
    isRegister,
    handleSubmit,
  } = useAuth({ mode });

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

  return (
    <main className="page-shell">
      <section className="auth-card">
        <Link
          href="/"
          className="brand"
          aria-label="FinanceFlow — página inicial"
          style={{ textDecoration: "none" }}
        >
          <span className="brand-mark">F</span>
          <span>FinanceFlow</span>
        </Link>

        <div className="intro">
          <p className="eyebrow">SUAS FINANÇAS, SOB CONTROLE</p>

          <h1>
            {isRegister
              ? "Comece sua organização financeira."
              : "Bom ter você de volta."}
          </h1>

          <p className="subtitle">
            {isRegister
              ? "Crie sua conta e dê o primeiro passo."
              : "Entre na sua conta para continuar."}
          </p>
        </div>

        <div className="mode-switch" aria-label="Tipo de acesso">
          <Link
            href="/login"
            className={!isRegister ? "mode active" : "mode"}
            aria-current={!isRegister ? "page" : undefined}
          >
            Entrar
          </Link>

          <Link
            href="/register"
            className={isRegister ? "mode active" : "mode"}
            aria-current={isRegister ? "page" : undefined}
          >
            Criar conta
          </Link>
        </div>

        <AuthForm
          isRegister={isRegister}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          message={message}
          error={error}
          onSubmit={handleSubmit}
        />

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
          {isRegister ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
          <Link href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Entrar" : "Cadastre-se"}
          </Link>
        </p>
      </section>

      <AuthVisualPanel />
    </main>
  );
}
