// Business logic ported from the design prototype's `Component` class (see
// design_handoff_hris_metrics_hub/HRIS Metrics Hub.dc.html — methods
// aggregateMetric, buildKpiSections, buildComboMetricCard, buildHighlights,
// buildYtdTableRows, pctChange, entryWarning). Kept as pure functions over a
// plain `allData` array so the UI layer owns rendering/styling decisions.
import {
  CATEGORY_DEFS,
  HIGHLIGHT_EXCLUDED_CATEGORIES,
  KPI_SECTIONS,
  MONTH_INITIALS,
  MONTH_NAMES,
  REPORT_RUN_METRIC_NAMES,
  type AggType,
  getMetricDef,
} from "./categoryDefs";

export interface MetricRow {
  category: string;
  metric: string;
  owner: string;
  unit: string;
  region: string;
  year: number;
  month: number;
  value: number;
}

export interface Filters {
  year: string; // "all" | "2024" | "2025" | "2026"
  month: string[]; // ["all"] or e.g. ["3","4"]
  category: string; // "all" | <category>
  region: string; // "all" | <region>
  owner: string; // "all" | <owner>
}

export const DEFAULT_FILTERS: Filters = { year: "all", month: ["all"], category: "all", region: "all", owner: "all" };

export interface Period {
  year: number;
  month: number;
}

export function getSelectedMonths(filters: Filters): number[] | null {
  const sel = filters.month;
  if (!sel || sel.length === 0 || sel.includes("all")) return null;
  return sel.map(Number);
}

export function applyFilters(rows: MetricRow[], filters: Filters): MetricRow[] {
  const selMonths = getSelectedMonths(filters);
  return rows.filter(
    (r) =>
      (filters.year === "all" || String(r.year) === filters.year) &&
      (!selMonths || selMonths.includes(r.month)) &&
      (filters.category === "all" || r.category === filters.category) &&
      (filters.region === "all" || r.region === filters.region) &&
      (filters.owner === "all" || r.owner === filters.owner)
  );
}

export function applyFiltersForPeriod(rows: MetricRow[], filters: Filters): MetricRow[] {
  return rows.filter(
    (r) =>
      (filters.category === "all" || r.category === filters.category) &&
      (filters.region === "all" || r.region === filters.region) &&
      (filters.owner === "all" || r.owner === filters.owner)
  );
}

export function resolvePeriod(allData: MetricRow[], filters: Filters): Period {
  const selMonths = getSelectedMonths(filters);
  const singleMonth = selMonths && selMonths.length === 1 ? selMonths[0] : null;
  if (filters.year !== "all" && singleMonth !== null) return { year: parseInt(filters.year), month: singleMonth };
  let candidates = allData;
  if (filters.year !== "all") candidates = candidates.filter((r) => String(r.year) === filters.year);
  if (singleMonth !== null) candidates = candidates.filter((r) => r.month === singleMonth);
  if (!candidates.length) return { year: 2026, month: 8 };
  return candidates.reduce((m, r) => (r.year > m.year || (r.year === m.year && r.month > m.month) ? r : m), candidates[0]);
}

export function priorPeriod(p: Period): Period {
  return p.month === 1 ? { year: p.year - 1, month: 12 } : { year: p.year, month: p.month - 1 };
}

export function monthsForYear(allData: MetricRow[], year: number): number[] {
  const max = allData.filter((r) => r.year === year).reduce((m, r) => Math.max(m, r.month), 0);
  const months: number[] = [];
  for (let m = 1; m <= (max || 12); m++) months.push(m);
  return months;
}

export function latestYear(allData: MetricRow[]): number {
  return allData.reduce((m, r) => Math.max(m, r.year), 2024);
}

export function aggregateMetric(
  allData: MetricRow[],
  filters: Filters,
  category: string,
  metric: string,
  aggType: AggType,
  year: number,
  months: number[],
  region?: string
): { value: number } | null {
  const rows = allData.filter(
    (r) =>
      r.category === category &&
      r.metric === metric &&
      r.year === year &&
      months.includes(r.month) &&
      (region ? r.region === region : filters.region === "all" || r.region === filters.region) &&
      (filters.owner === "all" || r.owner === filters.owner)
  );
  if (!rows.length) return null;
  if (aggType === "last") {
    const last = rows.reduce((a, b) => (b.month > a.month ? b : a));
    return { value: last.value };
  }
  const total = rows.reduce((s, r) => s + r.value, 0);
  return { value: aggType === "average" ? total / rows.length : total };
}

export function fmt(v: number, unit: string): string {
  if (unit === "%") return v.toFixed(1) + "%";
  if (v >= 1000) return Math.round(v).toLocaleString();
  return (Math.round(v * 10) / 10).toString();
}

export function getMetricAgg(allData: MetricRow[], filters: Filters, category: string, metricName: string, period: Period, region?: string): { value: number } | null {
  const rows = allData.filter(
    (r) =>
      r.category === category &&
      r.metric === metricName &&
      r.year === period.year &&
      r.month === period.month &&
      (region ? r.region === region : filters.region === "all" || r.region === filters.region) &&
      (filters.owner === "all" || r.owner === filters.owner)
  );
  if (!rows.length) return null;
  return { value: rows.reduce((s, r) => s + r.value, 0) / rows.length };
}

export function findRowValue(allData: MetricRow[], category: string, metric: string, owner: string, region: string, year: number, month: number): number | null {
  const r = allData.find((x) => x.category === category && x.metric === metric && x.owner === owner && x.region === region && x.year === year && x.month === month);
  return r ? r.value : null;
}

export function pctChange(cur: number, base: number | null | undefined): number | null {
  if (base === null || base === undefined || base === 0) return null;
  return ((cur - base) / base) * 100;
}

// true = favorable (green), false = unfavorable (red/amber), null = no data
export function isFavorable(pct: number | null, lowerIsBetter: boolean): boolean | null {
  if (pct === null) return null;
  return lowerIsBetter ? pct <= 0 : pct >= 0;
}

export function changeLabel(pct: number | null): string {
  return pct === null ? "—" : (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
}

export function lowerIsBetterFor(metricOrJoinedNames: string): boolean {
  return metricOrJoinedNames.includes("Ticket");
}

export interface Spark {
  month: number;
  value: number;
}

export interface Bar {
  pct: number; // 0-100, min-clamped to 8 in UI
  label: string;
  title: string;
}

export interface MetricCardData {
  cat: string;
  metric: string;
  unit: string;
  unitLabel: string;
  valueLabel: string;
  valueRaw: number;
  hasTarget: boolean;
  targetLabel: string;
  targetRaw: number | null;
  showAvgNote: boolean;
  showMom: boolean;
  momPctRaw: number | null;
  yoyPctRaw: number | null;
  momFavorable: boolean | null;
  yoyFavorable: boolean | null;
  onTarget: boolean | null;
  hasTargetMiss: boolean;
  bars: Bar[];
}

function buildBars(sparkPts: Spark[], unit: string): Bar[] {
  const maxSpark = Math.max(...sparkPts.map((s) => s.value), 1);
  return sparkPts.map((s) => ({
    pct: Math.max(8, Math.round((s.value / maxSpark) * 100)),
    label: MONTH_INITIALS[s.month - 1],
    title: `${MONTH_NAMES[s.month - 1]}: ${fmt(s.value, unit)}${unit !== "%" && unit !== "#" ? " " + unit : ""}`,
  }));
}

export function buildMetricCard(allData: MetricRow[], filters: Filters, displayCat: string, category: string, metricName: string): MetricCardData | null {
  const def = getMetricDef(category, metricName);
  if (!def) return null;
  const lowerIsBetter = lowerIsBetterFor(metricName);
  const selMonths = getSelectedMonths(filters);
  const isYtd = !(selMonths && selMonths.length === 1);

  let cur: { value: number } | null;
  let momPct: number | null;
  let yoyPct: number | null;
  let sparkPts: Spark[];

  if (isYtd) {
    const ytdYear = filters.year !== "all" ? parseInt(filters.year) : latestYear(allData);
    const ytdMonths = selMonths && selMonths.length > 1 ? [...selMonths].sort((a, b) => a - b) : monthsForYear(allData, ytdYear);
    cur = aggregateMetric(allData, filters, category, metricName, def.agg, ytdYear, ytdMonths);
    if (!cur) return null;
    const yoy = aggregateMetric(allData, filters, category, metricName, def.agg, ytdYear - 1, ytdMonths);
    momPct = null;
    yoyPct = yoy ? pctChange(cur.value, yoy.value) : null;
    sparkPts = ytdMonths.slice(-6).map((m) => {
      const a = getMetricAgg(allData, filters, category, metricName, { year: ytdYear, month: m });
      return { month: m, value: a ? a.value : 0 };
    });
  } else {
    const period = resolvePeriod(allData, filters);
    const prior = priorPeriod(period);
    const yoyPeriod = { year: period.year - 1, month: period.month };
    cur = getMetricAgg(allData, filters, category, metricName, period);
    if (!cur) return null;
    const prev = getMetricAgg(allData, filters, category, metricName, prior);
    const yoy = getMetricAgg(allData, filters, category, metricName, yoyPeriod);
    momPct = prev ? pctChange(cur.value, prev.value) : null;
    yoyPct = yoy ? pctChange(cur.value, yoy.value) : null;
    sparkPts = [];
    let p = period;
    for (let i = 0; i < 6; i++) {
      const agg = getMetricAgg(allData, filters, category, metricName, p);
      sparkPts.unshift({ month: p.month, value: agg ? agg.value : 0 });
      p = priorPeriod(p);
    }
  }

  const hasTarget = def.target !== null && def.target !== undefined;
  const onTarget = hasTarget ? (lowerIsBetter ? cur.value <= (def.target as number) : cur.value >= (def.target as number)) : null;

  return {
    cat: displayCat,
    metric: metricName,
    unit: def.unit,
    unitLabel: def.unit !== "%" && def.unit !== "#" ? def.unit : "",
    valueLabel: fmt(cur.value, def.unit),
    valueRaw: cur.value,
    hasTarget,
    targetLabel: hasTarget ? fmt(def.target as number, def.unit) : "",
    targetRaw: hasTarget ? (def.target as number) : null,
    showAvgNote: isYtd && def.agg === "average",
    showMom: !isYtd,
    momPctRaw: momPct,
    yoyPctRaw: yoyPct,
    momFavorable: isFavorable(momPct, lowerIsBetter),
    yoyFavorable: isFavorable(yoyPct, lowerIsBetter),
    onTarget,
    hasTargetMiss: hasTarget && onTarget === false,
    bars: buildBars(sparkPts, def.unit),
  };
}

function getMonthlyValue(allData: MetricRow[], filters: Filters, category: string, metricNames: string[], period: Period): number | null {
  let total = 0;
  let found = false;
  metricNames.forEach((name) => {
    const agg = getMetricAgg(allData, filters, category, name, period);
    if (agg) {
      total += agg.value;
      found = true;
    }
  });
  return found ? total : null;
}

export function buildComboMetricCard(
  allData: MetricRow[],
  filters: Filters,
  label: string,
  category: string,
  metricNames: string[],
  ytdAgg: AggType
): MetricCardData | null {
  const firstDef = CATEGORY_DEFS.find((d) => d.cat === category)?.metrics.find((m) => metricNames.includes(m.name));
  if (!firstDef) return null;
  const unit = firstDef.unit;
  const target = firstDef.target;
  const lowerIsBetter = metricNames.some((m) => m.includes("Ticket"));
  const selMonths = getSelectedMonths(filters);
  const isYtd = !(selMonths && selMonths.length === 1);

  const combinedForMonths = (year: number, months: number[]): number | null => {
    const vals: number[] = [];
    months.forEach((m) => {
      const v = getMonthlyValue(allData, filters, category, metricNames, { year, month: m });
      if (v !== null) vals.push(v);
    });
    if (!vals.length) return null;
    const total = vals.reduce((s, v) => s + v, 0);
    return ytdAgg === "average" ? total / vals.length : total;
  };

  let curVal: number | null;
  let momPct: number | null;
  let yoyPct: number | null;
  let sparkPts: Spark[];

  if (isYtd) {
    const ytdYear = filters.year !== "all" ? parseInt(filters.year) : latestYear(allData);
    const ytdMonths = selMonths && selMonths.length > 1 ? [...selMonths].sort((a, b) => a - b) : monthsForYear(allData, ytdYear);
    curVal = combinedForMonths(ytdYear, ytdMonths);
    if (curVal === null) return null;
    const yoyVal = combinedForMonths(ytdYear - 1, ytdMonths);
    momPct = null;
    yoyPct = yoyVal !== null ? pctChange(curVal, yoyVal) : null;
    sparkPts = ytdMonths.slice(-6).map((m) => ({ month: m, value: getMonthlyValue(allData, filters, category, metricNames, { year: ytdYear, month: m }) ?? 0 }));
  } else {
    const period = resolvePeriod(allData, filters);
    const prior = priorPeriod(period);
    const yoyPeriod = { year: period.year - 1, month: period.month };
    curVal = getMonthlyValue(allData, filters, category, metricNames, period);
    if (curVal === null) return null;
    const prevVal = getMonthlyValue(allData, filters, category, metricNames, prior);
    const yoyVal = getMonthlyValue(allData, filters, category, metricNames, yoyPeriod);
    momPct = prevVal !== null ? pctChange(curVal, prevVal) : null;
    yoyPct = yoyVal !== null ? pctChange(curVal, yoyVal) : null;
    sparkPts = [];
    let p = period;
    for (let i = 0; i < 6; i++) {
      const v = getMonthlyValue(allData, filters, category, metricNames, p);
      sparkPts.unshift({ month: p.month, value: v ?? 0 });
      p = priorPeriod(p);
    }
  }

  const hasTarget = target !== null && target !== undefined;
  const onTarget = hasTarget ? (lowerIsBetter ? curVal <= (target as number) : curVal >= (target as number)) : null;

  return {
    cat: label,
    metric: metricNames.join(" + "),
    unit,
    unitLabel: unit !== "%" && unit !== "#" ? unit : "",
    valueLabel: fmt(curVal, unit),
    valueRaw: curVal,
    hasTarget,
    targetLabel: hasTarget ? fmt(target as number, unit) : "",
    targetRaw: hasTarget ? (target as number) : null,
    showAvgNote: isYtd && ytdAgg === "average",
    showMom: !isYtd,
    momPctRaw: momPct,
    yoyPctRaw: yoyPct,
    momFavorable: isFavorable(momPct, lowerIsBetter),
    yoyFavorable: isFavorable(yoyPct, lowerIsBetter),
    onTarget,
    hasTargetMiss: hasTarget && onTarget === false,
    bars: buildBars(sparkPts, unit),
  };
}

export interface KpiSection {
  title: string;
  cards: MetricCardData[];
}

export function buildKpiSections(allData: MetricRow[], filters: Filters): KpiSection[] {
  return KPI_SECTIONS.map((section) => ({
    title: section.title,
    cards: section.tiles.map((t) => buildComboMetricCard(allData, filters, t.label, t.category, t.metrics, t.ytdAgg)).filter((c): c is MetricCardData => c !== null),
  })).filter((s) => s.cards.length);
}

export function buildHighlightSourceCards(allData: MetricRow[], filters: Filters): MetricCardData[] {
  const cards: MetricCardData[] = [];
  CATEGORY_DEFS.filter((d) => !HIGHLIGHT_EXCLUDED_CATEGORIES.includes(d.cat)).forEach((d) => {
    d.metrics.forEach((m) => {
      const card = buildMetricCard(allData, filters, d.cat, d.cat, m.name);
      if (card) cards.push(card);
    });
  });
  return cards;
}

export interface Highlights {
  risers: string[];
  decliners: string[];
  targetMisses: string[];
}

export function buildHighlights(cards: MetricCardData[], filters: Filters): Highlights {
  const selMonths = getSelectedMonths(filters);
  const isYtd = !(selMonths && selMonths.length === 1);
  const key: "yoyPctRaw" | "momPctRaw" = isYtd ? "yoyPctRaw" : "momPctRaw";
  const compareLabel = isYtd ? "year over year" : "vs prior month";
  const withValue = (v: string, unit: string) => (unit ? v + " " + unit : v);
  const withMove = cards.filter((c) => c[key] !== null && c[key] !== undefined);
  const risers = withMove
    .filter((c) => (c[key] as number) > 0)
    .sort((a, b) => (b[key] as number) - (a[key] as number))
    .slice(0, 5)
    .map((c) => `${c.metric} is up ${changeLabel(c[key])} ${compareLabel}, now ${withValue(c.valueLabel, c.unitLabel)}.`);
  const decliners = withMove
    .filter((c) => (c[key] as number) < 0)
    .sort((a, b) => (a[key] as number) - (b[key] as number))
    .slice(0, 5)
    .map((c) => `${c.metric} is down ${changeLabel(c[key])} ${compareLabel}, now ${withValue(c.valueLabel, c.unitLabel)}.`);
  const targetMisses = cards.filter((c) => c.hasTargetMiss).map((c) => `${c.metric} is below target: ${withValue(c.valueLabel, c.unitLabel)} vs a target of ${withValue(c.targetLabel, c.unitLabel)}.`);
  return { risers, decliners, targetMisses };
}

export function getActiveYearMonths(allData: MetricRow[], filters: Filters): { year: number; months: number[] } {
  const selMonths = getSelectedMonths(filters);
  if (selMonths && selMonths.length === 1) {
    const period = resolvePeriod(allData, filters);
    return { year: period.year, months: [period.month] };
  }
  const year = filters.year !== "all" ? parseInt(filters.year) : latestYear(allData);
  const months = selMonths && selMonths.length > 1 ? [...selMonths].sort((a, b) => a - b) : monthsForYear(allData, year);
  return { year, months };
}

export interface TopStats {
  pctValue: number | null;
  pctLabel: string;
  enhLabel: string;
  openValue: number;
  closedValue: number;
  ticketsLabel: string;
  runLabel: string;
}

export function buildTopStats(allData: MetricRow[], filters: Filters): TopStats {
  const { year, months } = getActiveYearMonths(allData, filters);
  const pct = aggregateMetric(allData, filters, "Project and Sprints", "% of Completed Projects", "last", year, months);
  const enh = aggregateMetric(allData, filters, "Project and Sprints", "# of enhancements in the Sprint", "sum", year, months);
  const open = aggregateMetric(allData, filters, "Operations", "# of open (new) Ticket", "sum", year, months);
  const closed = aggregateMetric(allData, filters, "Operations", "# of closed Ticket", "sum", year, months);
  let runTotal = 0;
  let runHasData = false;
  REPORT_RUN_METRIC_NAMES.forEach((name) => {
    const a = aggregateMetric(allData, filters, "Reporting and Analytics", name, "sum", year, months);
    if (a) {
      runTotal += a.value;
      runHasData = true;
    }
  });
  return {
    pctValue: pct ? pct.value : null,
    pctLabel: pct ? fmt(pct.value, "%") : "—",
    enhLabel: enh ? fmt(enh.value, "#") : "—",
    openValue: open ? open.value : 0,
    closedValue: closed ? closed.value : 0,
    ticketsLabel: open || closed ? `${fmt(open ? open.value : 0, "#")} / ${fmt(closed ? closed.value : 0, "#")}` : "— / —",
    runLabel: runHasData ? fmt(runTotal, "#") : "—",
  };
}

export function applySearch(rows: { category: string; metric: string }[], searchText: string) {
  const q = searchText.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((r) => r.category.toLowerCase().includes(q) || r.metric.toLowerCase().includes(q));
}

export interface TableRow {
  category: string;
  metric: string;
  region: string;
  owner: string;
  periodLabel: string;
  valueLabel: string;
  aggLabel: string;
  momLabel: string;
  momFavorable: boolean | null;
  yoyLabel: string;
  yoyFavorable: boolean | null;
}

export function buildMonthlyTableRows(allData: MetricRow[], filters: Filters, searchText: string): TableRow[] {
  const catOrder = new Map(CATEGORY_DEFS.map((d, i) => [d.cat, i]));
  let rows = applyFilters(allData, filters)
    .slice()
    .sort((a, b) => b.year - a.year || b.month - a.month || (catOrder.get(a.category) ?? 0) - (catOrder.get(b.category) ?? 0));
  rows = applySearch(rows, searchText) as MetricRow[];
  return rows.slice(0, 60).map((r) => {
    const lowerIsBetter = lowerIsBetterFor(r.metric);
    const priorP = priorPeriod({ year: r.year, month: r.month });
    const momBase = findRowValue(allData, r.category, r.metric, r.owner, r.region, priorP.year, priorP.month);
    const yoyBase = findRowValue(allData, r.category, r.metric, r.owner, r.region, r.year - 1, r.month);
    const momPct = pctChange(r.value, momBase);
    const yoyPct = pctChange(r.value, yoyBase);
    return {
      category: r.category,
      metric: r.metric,
      region: r.region,
      owner: r.owner,
      periodLabel: `${MONTH_NAMES[r.month - 1]} ${r.year}`,
      valueLabel: fmt(r.value, r.unit),
      aggLabel: "Monthly",
      momLabel: changeLabel(momPct),
      momFavorable: isFavorable(momPct, lowerIsBetter),
      yoyLabel: changeLabel(yoyPct),
      yoyFavorable: isFavorable(yoyPct, lowerIsBetter),
    };
  });
}

export function buildYtdTableRows(allData: MetricRow[], filters: Filters, searchText: string): TableRow[] {
  const selMonths = getSelectedMonths(filters);
  const year = filters.year !== "all" ? parseInt(filters.year) : latestYear(allData);
  const months = selMonths && selMonths.length > 1 ? [...selMonths].sort((a, b) => a - b) : monthsForYear(allData, year);
  const rows = applyFilters(allData, filters).filter((r) => r.year === year);
  const groups = new Map<string, { category: string; metric: string; region: string; owner: string; unit: string; values: number[]; months: number[] }>();
  rows.forEach((r) => {
    const key = [r.category, r.metric, r.region, r.owner].join("|");
    if (!groups.has(key)) groups.set(key, { category: r.category, metric: r.metric, region: r.region, owner: r.owner, unit: r.unit, values: [], months: [] });
    const g = groups.get(key)!;
    g.values.push(r.value);
    g.months.push(r.month);
  });
  const catOrder = new Map(CATEGORY_DEFS.map((d, i) => [d.cat, i]));
  let results: TableRow[] = [...groups.values()].map((g) => {
    const info = getMetricDef(g.category, g.metric);
    const agg: AggType = info ? info.agg : "sum";
    const total = g.values.reduce((s, v) => s + v, 0);
    let value: number;
    if (agg === "average") value = total / g.values.length;
    else if (agg === "last") {
      const maxM = Math.max(...g.months);
      value = g.values[g.months.indexOf(maxM)];
    } else value = total;
    const yoy = aggregateMetric(allData, filters, g.category, g.metric, agg, year - 1, months, g.region);
    const yoyPct = yoy ? pctChange(value, yoy.value) : null;
    const lowerIsBetter = lowerIsBetterFor(g.metric);
    return {
      category: g.category,
      metric: g.metric,
      region: g.region,
      owner: g.owner,
      periodLabel: `YTD ${year}`,
      valueLabel: fmt(value, g.unit),
      aggLabel: agg === "average" ? "Average" : agg === "last" ? "Last month" : "Sum",
      momLabel: "—",
      momFavorable: null,
      yoyLabel: changeLabel(yoyPct),
      yoyFavorable: isFavorable(yoyPct, lowerIsBetter),
    };
  });
  results = applySearch(results, searchText) as TableRow[];
  return results.sort((a, b) => (catOrder.get(a.category) ?? 0) - (catOrder.get(b.category) ?? 0)).slice(0, 60);
}

export function buildTableRows(allData: MetricRow[], filters: Filters, searchText: string): TableRow[] {
  const selMonths = getSelectedMonths(filters);
  const isYtd = !(selMonths && selMonths.length === 1);
  return isYtd ? buildYtdTableRows(allData, filters, searchText) : buildMonthlyTableRows(allData, filters, searchText);
}

export function getMonthFilterLabel(filters: Filters): string {
  if (filters.month.includes("all") || filters.month.length === 0) return "YTD";
  return filters.month
    .map(Number)
    .sort((a, b) => a - b)
    .map((m) => MONTH_NAMES[m - 1])
    .join(", ");
}

export function getPeriodLabel(allData: MetricRow[], filters: Filters): string {
  const selMonths = getSelectedMonths(filters);
  if (selMonths && selMonths.length === 1) {
    const period = resolvePeriod(allData, filters);
    return `${MONTH_NAMES[period.month - 1]} ${period.year}`;
  }
  const year = filters.year !== "all" ? parseInt(filters.year) : latestYear(allData);
  if (selMonths && selMonths.length > 1) {
    const sorted = [...selMonths].sort((a, b) => a - b);
    return sorted.map((m) => MONTH_NAMES[m - 1]).join(", ") + " " + year;
  }
  const months = monthsForYear(allData, year);
  return `YTD ${MONTH_NAMES[months[0] - 1]}–${MONTH_NAMES[months[months.length - 1] - 1]} ${year}`;
}

export function entryWarning(enteredRaw: string | undefined, lastVal: number | null): string {
  if (enteredRaw === undefined || enteredRaw === "" || lastVal === null || lastVal === undefined || lastVal === 0) return "";
  const entered = parseFloat(enteredRaw);
  if (isNaN(entered)) return "";
  const pctDiff = Math.abs(((entered - lastVal) / lastVal) * 100);
  if (pctDiff >= 50) return `⚠ ${entered >= lastVal ? "+" : "-"}${Math.round(pctDiff)}% vs last month (${lastVal}) — double-check`;
  return "";
}

export interface OwnerMetricRow {
  key: string;
  category: string;
  metric: string;
  region: string;
  unit: string;
  hasTarget: boolean;
  target: string;
  lastLabel: string;
  lastValue: number | null;
  value: string;
  warning: string;
}

export function getOwnerMetricRows(allData: MetricRow[], category: string, entryPeriod: Period, entryValues: Record<string, string>): OwnerMetricRow[] {
  const def = CATEGORY_DEFS.find((d) => d.cat === category);
  if (!def) return [];
  const prior = priorPeriod(entryPeriod);
  const rows: OwnerMetricRow[] = [];
  def.metrics.forEach((m) =>
    m.regions.forEach((region) => {
      const key = `${m.name}|${region}`;
      const last = getMetricAgg(allData, DEFAULT_FILTERS, def.cat, m.name, prior, region);
      const hasTarget = m.target !== null && m.target !== undefined;
      const value = entryValues[key] ?? "";
      rows.push({
        key,
        category: def.cat,
        metric: m.name,
        region,
        unit: m.unit,
        hasTarget,
        target: hasTarget ? `${m.target} ${m.unit}` : "",
        lastLabel: last ? fmt(last.value, m.unit) : "—",
        lastValue: last ? last.value : null,
        value,
        warning: entryWarning(value, last ? last.value : null),
      });
    })
  );
  return rows;
}

export interface OwnerGridRow {
  key: string;
  label: string;
  m3: string;
  m2: string;
  m1: string;
  value: string;
  warning: string;
}

export function getOwnerGridRows(allData: MetricRow[], category: string, entryPeriod: Period, entryValues: Record<string, string>): OwnerGridRow[] {
  const def = CATEGORY_DEFS.find((d) => d.cat === category);
  if (!def) return [];
  const p1 = priorPeriod(entryPeriod);
  const p2 = priorPeriod(p1);
  const p3 = priorPeriod(p2);
  const agg = (name: string, region: string, p: Period) => {
    const a = getMetricAgg(allData, DEFAULT_FILTERS, def.cat, name, p, region);
    const unit = def.metrics.find((m) => m.name === name)!.unit;
    return a ? fmt(a.value, unit) : "—";
  };
  const rows: OwnerGridRow[] = [];
  def.metrics.forEach((m) =>
    m.regions.forEach((region) => {
      const key = `${m.name}|${region}`;
      const lastAgg = getMetricAgg(allData, DEFAULT_FILTERS, def.cat, m.name, p1, region);
      const value = entryValues[key] ?? "";
      rows.push({
        key,
        label: m.name + (region !== "IHR" ? " · " + region : ""),
        m3: agg(m.name, region, p3),
        m2: agg(m.name, region, p2),
        m1: agg(m.name, region, p1),
        value,
        warning: entryWarning(value, lastAgg ? lastAgg.value : null),
      });
    })
  );
  return rows;
}

export function gridMonthLabels(entryPeriod: Period): { m3: string; m2: string; m1: string; cur: string } {
  const p1 = priorPeriod(entryPeriod);
  const p2 = priorPeriod(p1);
  const p3 = priorPeriod(p2);
  return {
    m3: MONTH_NAMES[p3.month - 1],
    m2: MONTH_NAMES[p2.month - 1],
    m1: MONTH_NAMES[p1.month - 1],
    cur: `${MONTH_NAMES[entryPeriod.month - 1]} ${entryPeriod.year}`,
  };
}
