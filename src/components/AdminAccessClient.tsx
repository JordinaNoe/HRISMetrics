"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { colors, fontFamily } from "@/lib/theme";

interface AccessRow {
  category: string;
  emails: string[];
}

export default function AdminAccessClient() {
  const [rows, setRows] = useState<AccessRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, "saved" | "error">>({});

  useEffect(() => {
    fetch("/api/access")
      .then((r) => r.json())
      .then((data) => {
        setRows(data.rows);
        const d: Record<string, string> = {};
        data.rows.forEach((r: AccessRow) => (d[r.category] = r.emails.join(", ")));
        setDrafts(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (category: string) => {
    setSavingCategory(category);
    setStatus((s) => ({ ...s, [category]: undefined as unknown as "saved" }));
    const emails = drafts[category]
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, emails }),
      });
      if (!res.ok) throw new Error();
      setStatus((s) => ({ ...s, [category]: "saved" }));
    } catch {
      setStatus((s) => ({ ...s, [category]: "error" }));
    } finally {
      setSavingCategory(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.pageBg, fontFamily, color: colors.textPrimary, padding: "32px 40px" }}>
      <div style={{ marginBottom: 8 }}>
        <Link href="/" style={{ fontSize: 13, color: colors.textSecondary }}>
          {"←"} Back to dashboard
        </Link>
      </div>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Manage category access</div>
      <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 24 }}>
        Comma-separated company emails allowed to enter data for each category. Admins (set via the ADMIN_EMAILS env var) can always enter data for every category.
      </div>

      {loading && <div style={{ color: colors.textTertiary }}>Loading…</div>}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
          {rows.map((row) => (
            <div key={row.category} style={{ background: colors.white, border: `1px solid ${colors.borderLight}`, borderRadius: 6, padding: "14px 16px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{row.category}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  value={drafts[row.category] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [row.category]: e.target.value }))}
                  placeholder="name@company.com, name2@company.com"
                  style={{ flex: 1, padding: "8px 10px", border: `1px solid ${colors.borderInput}`, borderRadius: 4, fontSize: 13 }}
                />
                <button
                  onClick={() => save(row.category)}
                  disabled={savingCategory === row.category}
                  style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: colors.action, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  Save
                </button>
              </div>
              {status[row.category] === "saved" && <div style={{ fontSize: 12, color: colors.positive, marginTop: 6 }}>Saved.</div>}
              {status[row.category] === "error" && <div style={{ fontSize: 12, color: colors.negative, marginTop: 6 }}>Failed to save.</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
