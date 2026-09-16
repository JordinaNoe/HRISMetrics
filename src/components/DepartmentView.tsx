"use client";

import { useMemo, useState } from "react";
import { buildTableRows, buildTopStats, getPeriodLabel, type Filters, type MetricRow, type TableRow } from "@/lib/metricsEngine";
import { colors, changeColor } from "@/lib/theme";
import TopStats from "./TopStats";

function exportCsv(rows: TableRow[]) {
  const esc = (s: string) => {
    s = String(s);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const header = ["Category", "Metric", "Period", "Aggregation", "Value", "MoM %", "YoY %"];
  const lines = [header.join(",")];
  rows.forEach((r) => lines.push([r.category, r.metric, r.periodLabel, r.aggLabel, r.valueLabel, r.momLabel, r.yoyLabel].map(esc).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "department_detail_export.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const thStyle: React.CSSProperties = { textAlign: "left", padding: "10px 14px", borderBottom: `2px solid ${colors.accent}`, color: colors.textPrimary, fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: "9px 14px", borderBottom: `1px solid ${colors.borderExtraLight}` };

export default function DepartmentView({ allData, filters }: { allData: MetricRow[]; filters: Filters }) {
  const [searchText, setSearchText] = useState("");
  const periodLabel = useMemo(() => getPeriodLabel(allData, filters), [allData, filters]);
  const topStats = useMemo(() => buildTopStats(allData, filters), [allData, filters]);
  const tableRows = useMemo(() => buildTableRows(allData, filters, searchText), [allData, filters, searchText]);

  return (
    <div style={{ padding: "24px 32px 40px" }}>
      <TopStats stats={topStats} periodLabel={periodLabel} variant="department" />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search category or metric…"
          style={{ padding: "8px 12px", border: `1px solid ${colors.borderLight}`, borderRadius: 4, fontSize: 13, flex: 1, minWidth: 200, maxWidth: 320 }}
        />
        <button
          onClick={() => exportCsv(tableRows)}
          style={{ padding: "8px 14px", border: `1px solid ${colors.borderLight}`, borderRadius: 4, background: colors.white, fontSize: 13, fontWeight: 600, color: colors.textBody, cursor: "pointer" }}
        >
          Export CSV
        </button>
      </div>

      <div style={{ background: colors.white, borderRadius: 10, overflow: "auto", maxHeight: 480, boxShadow: `0 0 0 1px ${colors.tableShadow}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, background: colors.tableHeaderBg }}>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Metric</th>
              <th style={thStyle}>Period</th>
              <th style={thStyle}>Aggregation</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Value</th>
              <th style={{ ...thStyle, textAlign: "right" }}>MoM %</th>
              <th style={{ ...thStyle, textAlign: "right" }}>YoY %</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr key={i}>
                <td style={tdStyle}>{row.category}</td>
                <td style={tdStyle}>{row.metric}</td>
                <td style={{ ...tdStyle, color: colors.textSecondary }}>{row.periodLabel}</td>
                <td style={{ ...tdStyle, color: colors.textSecondary }}>{row.aggLabel}</td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{row.valueLabel}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <span style={{ fontSize: 12, color: changeColor(row.momFavorable) }}>{row.momLabel}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <span style={{ fontSize: 12, color: changeColor(row.yoyFavorable) }}>{row.yoyLabel}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
