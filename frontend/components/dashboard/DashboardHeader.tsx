"use client";

import Link from "next/link";

type DashboardHeaderProps = {
  userName: string;
  loading: boolean;
  onLogout: () => void;
};

export default function DashboardHeader({
  userName,
  loading,
  onLogout,
}: DashboardHeaderProps) {
  return (
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
      <Link
        href="/"
        className="brand"
        aria-label="FinanceFlow — dashboard"
        style={{ textDecoration: "none" }}
      >
        <span className="brand-mark">F</span>
        <span>FinanceFlow</span>
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: "#718096", fontSize: "12px" }}>
          {userName}
        </span>

        <button
          className="secondary-button"
          type="button"
          onClick={onLogout}
          disabled={loading}
          style={{
            width: "auto",
            minHeight: "40px",
            marginTop: 0,
            padding: "9px 16px",
          }}
        >
          {loading ? "Saindo..." : "Sair da conta"}
        </button>
      </div>
    </header>
  );
}
