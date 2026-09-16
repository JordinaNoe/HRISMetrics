import { useMemo } from "react";
import {
  buildHighlightSourceCards,
  buildHighlights,
  buildKpiSections,
  buildTopStats,
  getPeriodLabel,
  type Filters,
  type MetricRow,
} from "@/lib/metricsEngine";
import { colors, fontFamily } from "@/lib/theme";
import TopStats from "./TopStats";
import Highlights from "./Highlights";
import MetricCard from "./MetricCard";

export default function LeadershipView({ allData, filters }: { allData: MetricRow[]; filters: Filters }) {
  const periodLabel = useMemo(() => getPeriodLabel(allData, filters), [allData, filters]);
  const topStats = useMemo(() => buildTopStats(allData, filters), [allData, filters]);
  const kpiSections = useMemo(() => buildKpiSections(allData, filters), [allData, filters]);
  const highlights = useMemo(() => buildHighlights(buildHighlightSourceCards(allData, filters), filters), [allData, filters]);
  const noCards = kpiSections.every((s) => s.cards.length === 0) || kpiSections.length === 0;

  return (
    <div style={{ padding: "32px 40px 48px" }}>
      <Highlights highlights={highlights} periodLabel={periodLabel} />
      <TopStats stats={topStats} periodLabel={periodLabel} variant="leadership" />

      {noCards && (
        <div style={{ padding: 40, textAlign: "center", color: colors.textTertiary, background: colors.white, border: `1px dashed ${colors.borderInput}`, borderRadius: 6 }}>
          No data matches these filters.
        </div>
      )}

      {kpiSections.map((section) => (
        <div key={section.title} style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 4, height: 16, background: colors.accent, borderRadius: 2 }} />
            <div style={{ fontFamily, fontWeight: 600, fontSize: 15, color: colors.textPrimary }}>
              {section.title} · {periodLabel}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
            {section.cards.map((card) => (
              <MetricCard key={card.cat + card.metric} card={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
