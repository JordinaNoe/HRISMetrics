import type { TopStats as TopStatsData } from "@/lib/metricsEngine";
import { colors, fontFamily } from "@/lib/theme";

function Tile({ label, periodLabel, value, valueFontSize, pad, pie }: { label: string; periodLabel?: string; value: string; valueFontSize: number; pad: string; pie?: { pct: number; title: string } }) {
  return (
    <div style={{ background: colors.cardBg, borderRadius: 10, padding: pad, position: "relative", overflow: "hidden", display: pie ? "flex" : undefined, alignItems: pie ? "center" : undefined, gap: pie ? 16 : undefined }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: colors.accent }} />
      {pie && (
        <div
          title={pie.title}
          style={{ background: `conic-gradient(${colors.accent} 0% ${pie.pct}%, ${colors.borderLight} ${pie.pct}% 100%)`, borderRadius: "50%", width: 56, height: 56, flexShrink: 0 }}
        />
      )}
      <div>
        <div style={{ fontSize: 12, color: colors.textSecondary }}>
          {label}
          {periodLabel ? ` · ${periodLabel}` : ""}
        </div>
        <div style={{ fontFamily, fontWeight: 700, fontSize: valueFontSize, marginTop: pie ? 0 : 6 }}>{value}</div>
      </div>
    </div>
  );
}

export default function TopStats({ stats, periodLabel, variant }: { stats: TopStatsData; periodLabel: string; variant: "leadership" | "department" }) {
  const isLeadership = variant === "leadership";
  const pad = isLeadership ? "20px 20px 20px 24px" : "16px 16px 16px 20px";
  const valueFontSize = isLeadership ? 28 : 26;

  const tiles = (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${isLeadership ? 200 : 180}px, 1fr))`, gap: isLeadership ? 20 : 16 }}>
      <Tile
        label="% of Completed Projects"
        periodLabel={periodLabel}
        value={stats.pctLabel}
        valueFontSize={valueFontSize}
        pad={pad}
        pie={isLeadership ? { pct: Math.max(0, Math.min(100, stats.pctValue ?? 0)), title: stats.pctValue !== null ? `${stats.pctLabel} of projects completed` : "No data" } : undefined}
      />
      <Tile label="Enhancements" value={stats.enhLabel} valueFontSize={valueFontSize} pad={pad} />
      <Tile label="Operation Tickets Open / Closed" value={stats.ticketsLabel} valueFontSize={valueFontSize} pad={pad} />
      <Tile label="Reports Run Counts" value={stats.runLabel} valueFontSize={valueFontSize} pad={pad} />
    </div>
  );

  if (isLeadership) {
    return <div style={{ border: `1.5px solid ${colors.accent}`, borderRadius: 14, padding: 20, marginBottom: 32 }}>{tiles}</div>;
  }
  return <div style={{ marginBottom: 24 }}>{tiles}</div>;
}
