"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./AuthPage.css";
import { API_URL, getApiError } from "@/lib/finance";

type AuthPageProps = {
  mode: "login" | "register";
};

export default function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok && !cancelled) {
          router.replace("/");
          return;
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";

      const payload = isRegister
        ? {
            name: name.trim(),
            email: email.trim(),
            password,
          }
        : {
            email: email.trim(),
            password,
          };

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

      if (isRegister) {
        setMessage(
          "Conta criada com sucesso! Agora entre com seu e-mail e senha.",
        );
        setName("");
        setPassword("");
        return;
      }

      const sessionResponse = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!sessionResponse.ok) {
        throw new Error(
          "Login realizado, mas não foi possível confirmar a sessão.",
        );
      }

      router.replace("/");
      router.refresh();
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

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
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
                isRegister
                  ? "Pelo menos 8 caracteres"
                  : "Digite sua senha"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={isRegister ? 8 : 1}
              maxLength={72}
              autoComplete={
                isRegister ? "new-password" : "current-password"
              }
              required
            />

            {isRegister && (
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
              : isRegister
                ? "Criar minha conta"
                : "Entrar na minha conta"}

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
          {isRegister ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
          <Link href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Entrar" : "Cadastre-se"}
          </Link>
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
            Organize sua vida financeira com mais clareza e tome decisões
            com confiança.
          </p>

          <div className="preview-card">
            <div className="preview-top">
              <span>Resumo financeiro</span>
              <span className="preview-period">DEMONSTRAÇÃO</span>
            </div>

            <div className="preview-label">
              Controle em um só lugar
            </div>

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
              {Array.from({ length: 12 }, (_, index) => (
                <span key={index} />
              ))}
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
