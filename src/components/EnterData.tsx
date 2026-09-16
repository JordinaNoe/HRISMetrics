"use client";

import { useMemo, useState } from "react";
import { CATEGORY_DEFS, MONTH_NAMES } from "@/lib/categoryDefs";
import { getOwnerGridRows, getOwnerMetricRows, gridMonthLabels, type MetricRow, type Period } from "@/lib/metricsEngine";
import { colors, fontFamily, segBtnStyle } from "@/lib/theme";
import type { SessionUser } from "./DashboardApp";

const selectStyle = {
  padding: "9px 12px",
  border: `1px solid ${colors.borderLight}`,
  borderRadius: 4,
  background: colors.white,
  fontSize: 13,
};

export default function EnterData({ allData, user, onSaved }: { allData: MetricRow[]; user: SessionUser; onSaved: () => void }) {
  const availableCategories = user.isAdmin ? CATEGORY_DEFS.map((d) => d.cat) : user.editableCategories;

  const [entryMode, setEntryMode] = useState<"form" | "grid">("form");
  const [entryCategory, setEntryCategory] = useState<string>(availableCategories[0] ?? "");
  const [entryPeriod, setEntryPeriod] = useState<Period>({ year: 2026, month: 8 });
  const [entryValues, setEntryValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const setEntryValue = (key: string, val: string) => {
    setEntryValues((v) => ({ ...v, [key]: val }));
    setSavedFlash(false);
  };

  const onCategoryChange = (cat: string) => {
    setEntryCategory(cat);
    setEntryValues({});
    setSavedFlash(false);
  };
  const onYearChange = (year: number) => {
    setEntryPeriod((p) => ({ ...p, year }));
    setEntryValues({});
  };
  const onMonthChange = (month: number) => {
    setEntryPeriod((p) => ({ ...p, month }));
    setEntryValues({});
  };

  const ownerMetricRows = useMemo(() => (entryCategory ? getOwnerMetricRows(allData, entryCategory, entryPeriod, entryValues) : []), [allData, entryCategory, entryPeriod, entryValues]);
  const gridRows = useMemo(() => (entryCategory ? getOwnerGridRows(allData, entryCategory, entryPeriod, entryValues) : []), [allData, entryCategory, entryPeriod, entryValues]);
  const gridLabels = useMemo(() => gridMonthLabels(entryPeriod), [entryPeriod]);

  if (!availableCategories.length) {
    return (
      <div style={{ padding: "24px 32px 60px", maxWidth: 760 }}>
        <div style={{ color: colors.textSecondary, fontSize: 14 }}>You don&apos;t have edit access to any category yet. Ask an admin to grant you access on the Admin &gt; Access page.</div>
      </div>
    );
  }

  const submitEntry = async () => {
    const def = CATEGORY_DEFS.find((d) => d.cat === entryCategory);
    if (!def) return;
    const entries: { metric: string; region: string; value: number }[] = [];
    def.metrics.forEach((m) =>
      m.regions.forEach((region) => {
        const key = `${m.name}|${region}`;
        const raw = entryValues[key];
        if (raw === undefined || raw === "") return;
        const value = parseFloat(raw);
        if (Number.isNaN(value)) return;
        entries.push({ metric: m.name, region, value });
      })
    );
    if (!entries.length) return;

    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: entryCategory, year: entryPeriod.year, month: entryPeriod.month, entries }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      setEntryValues({});
      setSavedFlash(true);
      onSaved();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 760 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        <button style={segBtnStyle(entryMode === "form")} onClick={() => setEntryMode("form")}>
          Form view
        </button>
        <button style={segBtnStyle(entryMode === "grid")} onClick={() => setEntryMode("grid")}>
          Grid view
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <select value={entryCategory} onChange={(e) => onCategoryChange(e.target.value)} style={selectStyle}>
          {availableCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={String(entryPeriod.year)} onChange={(e) => onYearChange(parseInt(e.target.value))} style={selectStyle}>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <select value={String(entryPeriod.month)} onChange={(e) => onMonthChange(parseInt(e.target.value))} style={selectStyle}>
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={String(i + 1)}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {entryMode === "form" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ownerMetricRows.map((m) => (
            <div key={m.key} style={{ background: colors.white, border: `1px solid ${colors.borderLight}`, borderRadius: 6, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.metric}</div>
                <div style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
                  {m.category} · {m.region} · last month {m.lastLabel}
                  {m.hasTarget ? ` · target ${m.target}` : ""}
                </div>
              </div>
              <div>
                <input
                  type="number"
                  value={m.value}
                  onChange={(e) => setEntryValue(m.key, e.target.value)}
                  placeholder={m.lastLabel}
                  style={{ width: 110, padding: "9px 10px", border: `1px solid ${colors.borderInput}`, borderRadius: 4, fontSize: 14, textAlign: "right" }}
                />
                {m.warning && <div style={{ fontSize: 11, color: colors.negative, marginTop: 4, maxWidth: 180, textAlign: "right" }}>{m.warning}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {entryMode === "grid" && (
        <div style={{ background: colors.white, border: `1px solid ${colors.borderLight}`, borderRadius: 6, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "10px 14px", borderBottom: `1px solid ${colors.borderLight}`, color: colors.textSecondary }}>Metric</th>
                <th style={{ textAlign: "right", padding: "10px 14px", borderBottom: `1px solid ${colors.borderLight}`, color: colors.textSecondary }}>{gridLabels.m3}</th>
                <th style={{ textAlign: "right", padding: "10px 14px", borderBottom: `1px solid ${colors.borderLight}`, color: colors.textSecondary }}>{gridLabels.m2}</th>
                <th style={{ textAlign: "right", padding: "10px 14px", borderBottom: `1px solid ${colors.borderLight}`, color: colors.textSecondary }}>{gridLabels.m1}</th>
                <th style={{ textAlign: "right", padding: "10px 14px", borderBottom: `1px solid ${colors.borderLight}`, background: colors.gridHeaderBg, color: colors.textBody }}>{gridLabels.cur}</th>
              </tr>
            </thead>
            <tbody>
              {gridRows.map((g) => (
                <tr key={g.key}>
                  <td style={{ padding: "9px 14px", borderBottom: `1px solid ${colors.borderExtraLight}` }}>{g.label}</td>
                  <td style={{ padding: "9px 14px", borderBottom: `1px solid ${colors.borderExtraLight}`, textAlign: "right", color: colors.textTertiary }}>{g.m3}</td>
                  <td style={{ padding: "9px 14px", borderBottom: `1px solid ${colors.borderExtraLight}`, textAlign: "right", color: colors.textTertiary }}>{g.m2}</td>
                  <td style={{ padding: "9px 14px", borderBottom: `1px solid ${colors.borderExtraLight}`, textAlign: "right", color: colors.textTertiary }}>{g.m1}</td>
                  <td style={{ padding: "6px 10px", borderBottom: `1px solid ${colors.borderExtraLight}`, background: colors.gridInputBg }}>
                    <input
                      type="number"
                      value={g.value}
                      onChange={(e) => setEntryValue(g.key, e.target.value)}
                      style={{ width: 90, padding: "6px 8px", border: `1px solid ${colors.borderInput}`, borderRadius: 4, fontSize: 13, textAlign: "right" }}
                    />
                    {g.warning && <div style={{ fontSize: 10, color: colors.negative, marginTop: 2 }}>{g.warning}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
        <button
          onClick={submitEntry}
          disabled={saving}
          style={{ padding: "11px 22px", borderRadius: 4, border: "none", background: colors.action, color: "#fff", fontFamily, fontWeight: 600, fontSize: 14, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Saving…" : "Save this month's data"}
        </button>
        {savedFlash && <div style={{ fontSize: 13, color: colors.positive, fontWeight: 600 }}>Saved — the dashboard updates immediately.</div>}
        {saveError && <div style={{ fontSize: 13, color: colors.negative, fontWeight: 600 }}>{saveError}</div>}
      </div>
    </div>
  );
}
