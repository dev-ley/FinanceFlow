"use client";

import Link from "next/link";
import "./DashboardHeader.css";

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
    <header className="dashboard-header">
      <Link
        href="/"
        className="dashboard-header__brand"
        aria-label="FinanceFlow — dashboard"
      >
        <span className="dashboard-header__brand-mark">F</span>
        <span>FinanceFlow</span>
      </Link>

      <div className="dashboard-header__actions">
        <span className="dashboard-header__user-name">
          {userName}
        </span>

        <button
          className="secondary-button dashboard-header__logout-button"
          type="button"
          onClick={onLogout}
          disabled={loading}
        >
          {loading ? "Saindo..." : "Sair da conta"}
        </button>
      </div>
    </header>
  );
}