"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { colors, fontFamily, navBtnStyle } from "@/lib/theme";

export default function Header({
  lastUpdated,
  tab,
  setTab,
  userEmail,
  isAdmin,
}: {
  lastUpdated: string | null;
  tab: "dashboard" | "entry";
  setTab: (t: "dashboard" | "entry") => void;
  userEmail: string;
  isAdmin: boolean;
}) {
  return (
    <div style={{ background: colors.white, borderBottom: `1px solid ${colors.borderLight}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, padding: "8px 32px 0", fontSize: 12, color: colors.textTertiary }}>
        <span>{userEmail}</span>
        {isAdmin && (
          <Link href="/admin/access" style={{ color: colors.textSecondary, fontWeight: 600, textDecoration: "none" }}>
            Admin
          </Link>
        )}
        <button
          onClick={() => signOut({ redirectTo: "/signin" })}
          style={{ background: "none", border: "none", color: colors.textSecondary, fontWeight: 600, fontSize: 12, cursor: "pointer", padding: 0 }}
        >
          Sign out
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 32px 18px", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily, fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em", color: colors.textPrimary }}>HRIS Metrics Hub</div>
          <div style={{ fontFamily, fontStyle: "normal", color: colors.textSecondary, fontSize: 13, marginTop: 2, fontWeight: 700 }}>Entered monthly by the team, tracked continuously by leadership</div>
          <div style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>Data last updated: {lastUpdated ?? "—"}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={navBtnStyle(tab === "dashboard")} onClick={() => setTab("dashboard")}>
            Dashboard
          </button>
          <button style={navBtnStyle(tab === "entry")} onClick={() => setTab("entry")}>
            Enter Data
          </button>
        </div>
      </div>
    </div>
  );
}
