// Design tokens ported verbatim from the handoff README's "Design Tokens"
// section — keep in sync with that spec, don't invent new values here.
export const colors = {
  accent: "#BF0000", // card left-accent stripes, section bars, table header underline, pie fill, top-stats outline
  action: "oklch(0.5 0.18 25)", // primary buttons / active nav
  textPrimary: "#18181b",
  textSecondary: "#71717a",
  textTertiary: "#a1a1aa",
  textBody: "#3f3f46",
  borderLight: "#e4e4e7",
  borderExtraLight: "#f4f4f5",
  borderInput: "#d4d4d8",
  pageBg: "oklch(0.98 0.002 25)",
  cardBg: "oklch(0.985 0.002 25)",
  white: "#fff",
  positive: "oklch(0.5 0.13 150)",
  positiveBg: "oklch(0.95 0.05 150)",
  positiveText: "oklch(0.4 0.13 150)",
  negative: "oklch(0.55 0.16 40)",
  negativeBg: "oklch(0.96 0.05 80)",
  negativeText: "oklch(0.45 0.13 60)",
  tableHeaderBg: "oklch(0.97 0.002 25)",
  tableShadow: "oklch(0.92 0.002 25)",
  gridInputBg: "oklch(0.98 0.01 25)",
  gridHeaderBg: "oklch(0.96 0.03 25)",
} as const;

export const fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";

import type { CSSProperties } from "react";

export function navBtnStyle(active: boolean): CSSProperties {
  return {
    padding: "9px 18px",
    borderRadius: 4,
    border: `1px solid ${active ? "transparent" : colors.borderLight}`,
    background: active ? colors.action : colors.white,
    color: active ? "#fff" : colors.textBody,
    fontFamily,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  };
}

export function segBtnStyle(active: boolean): CSSProperties {
  return {
    padding: "7px 14px",
    borderRadius: 3,
    border: `1px solid ${colors.borderLight}`,
    background: active ? colors.textPrimary : colors.white,
    color: active ? "#fff" : "#52525b",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };
}

export function changeColor(favorable: boolean | null): string {
  if (favorable === null) return colors.textTertiary;
  return favorable ? colors.positive : colors.negative;
}

export function onTargetStyle(onTarget: boolean | null): CSSProperties {
  if (onTarget === null) return { display: "none" };
  return {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 3,
    background: onTarget ? colors.positiveBg : colors.negativeBg,
    color: onTarget ? colors.positiveText : colors.negativeText,
    width: "fit-content",
    marginTop: 8,
  };
}
