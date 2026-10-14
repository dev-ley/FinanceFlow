
// Hook responsável pela sessão do utilizador no FinanceFlow.
// Verifica a autenticação, controla os estados de carregamento e
// das mensagens, e executa o logout com redirecionamento para o login.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { API_URL } from "@/lib/finance";

import type { User } from "@/lib/finance";

export default function useDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  async function handleLogout(onLogoutCleanup: () => void) {
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
      onLogoutCleanup();

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

  return {
    user,
    checkingSession,
    loading,
    message,
    error,
    setMessage,
    setError,
    handleLogout,
  };
}
