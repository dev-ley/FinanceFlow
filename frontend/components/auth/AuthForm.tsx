
/**
 * Componente responsável pelo formulário de autenticação.
 * Apresenta os campos de login ou cadastro, as mensagens
 * de feedback e o botão para submeter os dados.
 */

"use client";

import type { FormEvent } from "react";

interface AuthFormProps {
  isRegister: boolean;
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  message: string;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AuthForm({
  isRegister,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  message,
  error,
  onSubmit,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="auth-form">
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
  );
}
