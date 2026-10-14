
// Hook responsável pela autenticação do FinanceFlow.
// Verifica a sessão existente e gere o login, o cadastro, 
// os estados de carregamento e as mensagens de feedback.

"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { API_URL, getApiError } from "@/lib/finance";

interface UseAuthProps {
  mode: "login" | "register";
}

export default function useAuth({ mode }: UseAuthProps) {
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
      const endpoint = isRegister
        ? "/auth/register"
        : "/auth/login";

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

  return {
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
  };
}
