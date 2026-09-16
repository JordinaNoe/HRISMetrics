import type { Highlights as HighlightsData } from "@/lib/metricsEngine";
import { colors } from "@/lib/theme";

function Column({ title, items, bullet, bulletColor }: { title: string; items: string[]; bullet: string; bulletColor: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((h, i) => (
          <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: colors.textBody, lineHeight: 1.5 }}>
            <div style={{ color: bulletColor }}>{bullet}</div>
            <div>{h}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Highlights({ highlights, periodLabel }: { highlights: HighlightsData; periodLabel: string }) {
  const hasHighlights = highlights.risers.length || highlights.decliners.length || highlights.targetMisses.length;
  if (!hasHighlights) return null;

  return (
    <div style={{ background: colors.cardBg, borderRadius: 10, padding: "18px 20px 18px 24px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: colors.accent }} />
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: colors.textPrimary }}>Highlights · {periodLabel}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
        <Column title="Risers" items={highlights.risers} bullet="▲" bulletColor={colors.positive} />
        <Column title="Decliners" items={highlights.decliners} bullet="▼" bulletColor={colors.negative} />
        {highlights.targetMisses.length > 0 && <Column title="Below target" items={highlights.targetMisses} bullet="•" bulletColor={colors.negative} />}
      </div>
    </div>
  );
}
