"use client";

import { useState } from "react";
import { MONTH_NAMES } from "@/lib/categoryDefs";
import { getMonthFilterLabel, type Filters } from "@/lib/metricsEngine";
import { colors, segBtnStyle } from "@/lib/theme";

const selectStyle = {
  padding: "8px 10px",
  border: `1px solid ${colors.borderLight}`,
  borderRadius: 4,
  background: colors.white,
  fontSize: 13,
  color: colors.textBody,
};

export default function FiltersBar({
  filters,
  setFilters,
  categories,
  audienceView,
  setAudienceView,
}: {
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  categories: string[];
  audienceView: "leadership" | "department";
  setAudienceView: (v: "leadership" | "department") => void;
}) {
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const ytdChecked = filters.month.includes("all") || filters.month.length === 0;

  const toggleMonth = (v: string) => {
    let arr = filters.month.filter((x) => x !== "all");
    arr = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
    if (arr.length === 0) arr = ["all"];
    setFilters({ month: arr });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, padding: "20px 32px 0" }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select value={filters.year} onChange={(e) => setFilters({ year: e.target.value })} style={selectStyle}>
          <option value="all">All years</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>

        <div style={{ position: "relative" }}>
          <button onClick={() => setMonthDropdownOpen((o) => !o)} style={{ ...selectStyle, cursor: "pointer", minWidth: 110, textAlign: "left" }}>
            {getMonthFilterLabel(filters)} {"▾"}
          </button>
          {monthDropdownOpen && (
            <>
              <div onClick={() => setMonthDropdownOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 15 }} />
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: 4,
                  background: colors.white,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 6,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: 6,
                  zIndex: 20,
                  minWidth: 150,
                  maxHeight: 280,
                  overflow: "auto",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={ytdChecked} onChange={() => setFilters({ month: ["all"] })} />
                  YTD
                </label>
                <div style={{ borderTop: `1px solid ${colors.borderExtraLight}`, margin: "4px 0" }} />
                {MONTH_NAMES.map((name, i) => {
                  const v = String(i + 1);
                  return (
                    <label key={v} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", fontSize: 13, cursor: "pointer" }}>
                      <input type="checkbox" checked={filters.month.includes(v)} onChange={() => toggleMonth(v)} />
                      {name}
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <select value={filters.category} onChange={(e) => setFilters({ category: e.target.value })} style={selectStyle}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button style={segBtnStyle(audienceView === "leadership")} onClick={() => setAudienceView("leadership")}>
          Leadership summary
        </button>
        <button style={segBtnStyle(audienceView === "department")} onClick={() => setAudienceView("department")}>
          Department detail
        </button>
      </div>
    </div>
  );
}
