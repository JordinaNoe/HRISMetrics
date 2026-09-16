import { changeLabel, type MetricCardData } from "@/lib/metricsEngine";
import { colors, changeColor, onTargetStyle } from "@/lib/theme";

export default function MetricCard({ card }: { card: MetricCardData }) {
  return (
    <div style={{ background: colors.cardBg, borderRadius: 10, padding: "22px 22px 22px 26px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: colors.accent }} />
      <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.03em" }}>{card.cat}</div>
      <div style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>{card.metric}</div>
      {card.showAvgNote && <div style={{ fontSize: 11, color: colors.textTertiary, fontStyle: "italic", marginTop: 2 }}>Year average</div>}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 30 }}>{card.valueLabel}</div>
        <div style={{ fontSize: 12, color: colors.textTertiary }}>{card.unitLabel}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
        {card.showMom && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: changeColor(card.momFavorable) }}>{changeLabel(card.momPctRaw)}</div>
            <div style={{ fontSize: 10, color: colors.textTertiary }}>MoM</div>
          </div>
        )}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: changeColor(card.yoyFavorable) }}>{changeLabel(card.yoyPctRaw)}</div>
          <div style={{ fontSize: 10, color: colors.textTertiary }}>YoY</div>
        </div>
      </div>
      {card.hasTarget && <div style={onTargetStyle(card.onTarget)}>{card.onTarget ? "On target" : "Below target"}</div>}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32, marginTop: 14 }}>
        {card.bars.map((bar, i) => (
          <div key={i} title={bar.title} style={{ flex: 1, background: colors.borderInput, borderRadius: 1, cursor: "default", height: `${bar.pct}%` }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
        {card.bars.map((bar, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: colors.textTertiary }}>
            {bar.label}
          </div>
        ))}
      </div>
      {card.hasTarget && (
        <div style={{ fontSize: 11, color: colors.textTertiary, marginTop: 8 }}>
          Target: {card.targetLabel} {card.unitLabel}
        </div>
      )}
    </div>
  );
}
