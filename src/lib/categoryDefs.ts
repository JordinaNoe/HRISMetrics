// Ported verbatim from the design prototype's `CATEGORY_DEFS` (see
// design_handoff_hris_metrics_hub/HRIS Metrics Hub.dc.html) — this is fixed
// reference metadata (which metrics exist, their unit/target/aggregation
// rule/regions), not something entered through the UI.

export type AggType = "sum" | "average" | "last";

export interface MetricDef {
  name: string;
  unit: string;
  target: number | null;
  agg: AggType;
  regions: string[];
}

export interface CategoryDef {
  cat: string;
  owner: string;
  primary: string;
  metrics: MetricDef[];
}

export const CATEGORY_DEFS: CategoryDef[] = [
  {
    cat: "Project and Sprints",
    owner: "Brian Wong",
    primary: "# Total Completed Projects from the Yokoten  Projects list",
    metrics: [
      { name: "# Total Completed Projects from the Yokoten  Projects list", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "# Total Completed Projects not from the Yokoten Projects list", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "Business efficiency External cost saving (hours per year) for Projects and Enhancements", unit: "hrs/yr", target: null, agg: "sum", regions: ["IHR"] },
      { name: "# of Sprints", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "# of enhancements in the Sprint", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "# of enhancements re-scheduled", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "% of Completed Projects", unit: "%", target: null, agg: "last", regions: ["IHR"] },
    ],
  },
  {
    cat: "Workday usage/Company Statistics",
    owner: "Jordina Noe",
    primary: "Active employees",
    metrics: [
      { name: "Active employees", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Contingent Workers", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Workday users", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Unique users that logged one", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Logon sessions", unit: "#", target: null, agg: "average", regions: ["IHR"] },
    ],
  },
  {
    cat: "Workday usage/Logon Sessions",
    owner: "Jordina Noe",
    primary: "Total Logon sessions from Phone",
    metrics: [
      { name: "Total Logon sessions from Phone", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Total Logon sessions from tablet", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Total Logon sessions from desktop", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Unique Logon sessions from Phone", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Unique Logon sessions from tablet", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Unique Logon sessions from desktop", unit: "#", target: null, agg: "average", regions: ["IHR"] },
    ],
  },
  {
    cat: "Wordday usage /Self Service",
    owner: "Jordina Noe",
    primary: "# ESS initiated  transactions",
    metrics: [
      { name: "# ESS initiated  transactions", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "# MSS initiated transactions", unit: "#", target: null, agg: "average", regions: ["IHR"] },
    ],
  },
  {
    cat: "Slack/Team usage",
    owner: "Jordina Noe",
    primary: "Slack usage",
    metrics: [
      { name: "Slack usage", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "Teams usage", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
    ],
  },
  {
    cat: "Customer Satisfaction Survey",
    owner: "Jordina Noe",
    primary: "Project Customer Satisfaction survey - # survey sent in the month",
    metrics: [
      { name: "Project Customer Satisfaction survey - # survey sent in the month", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "YTD Project Customer Satisfaction survey - overall response rate  to date", unit: "%", target: null, agg: "average", regions: ["IHR"] },
      { name: "YTD Project Customer Satisfaction survey - overall satisfaction score", unit: "%", target: null, agg: "average", regions: ["IHR"] },
    ],
  },
  {
    cat: "HRIS Training",
    owner: "Brian Wong",
    primary: "HRIS internal training - people",
    metrics: [
      { name: "HRIS internal training - people", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "HRIS internal training - training units", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
    ],
  },
  {
    cat: "HR Training by HRIS",
    owner: "Jordina Noe",
    primary: "HRIS training HR - delivery hours",
    metrics: [
      { name: "HRIS training HR - delivery hours", unit: "hrs", target: null, agg: "sum", regions: ["IHR"] },
      { name: "HRIS training HR - prep and admin hours", unit: "hrs", target: null, agg: "sum", regions: ["IHR"] },
      { name: "HRIS training HRBPs - number of attendees", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
    ],
  },
  {
    cat: "Reporting and Analytics",
    owner: "Cristina Be",
    primary: "# Total Completed Requests",
    metrics: [
      { name: "# Total Completed Requests", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "% Meeting SLA", unit: "%", target: 95, agg: "average", regions: ["IHR"] },
      { name: "# Data Governance Committee Reviews", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "# Completed Projects/Project Engagements", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "# New published Mgr SS/HR BP SS reports", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "Run Counts - CR Reports", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Run Counts - My Org Overview Dashboard", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Run Counts - Ad-hoc Reports", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Shared reports removed", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "Calc Fields Instance Consolidated", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
    ],
  },
  {
    cat: "Operations",
    owner: "Girija Manavaliah",
    primary: "# of open (new) Ticket",
    metrics: [
      { name: "# of open (new) Ticket", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "# of closed Ticket", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "# Open Remediation/ Breakfix ", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "SLA - IHR", unit: "%", target: 96.5, agg: "average", regions: ["IHR"] },
      { name: "# of Total Open (new) ticket", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "RFW", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
      { name: "Answers", unit: "#", target: null, agg: "sum", regions: ["IHR"] },
    ],
  },
  {
    cat: "Core & Cross Applications",
    owner: "Takashi Otake",
    primary: "# active time tracking users",
    metrics: [
      { name: "# active time tracking users", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "# Mobile expense receipts user count", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "# Business process events initiated", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "# Business process definitions", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "HCM Integration events", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "HCM Cloud Integration Systems", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "HCM Core Connector Worker Integration events", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "# of Japanese Language enabled users", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Staffing events", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Talent management events", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Active Job profiles", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Compensation plans", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Leave types", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Time off plans", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Active Leaves", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Number of Employees with a Contract", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Total Number of MSS BP Steps done by delegate", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Number of Employees with an active International Assignment", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Expense reports approved", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Active supervisory organizations", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Active cost centers", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Active Companies", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Active Suppliers (used for recruiting companies and expenses)", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Total Learning Course Enrolment Events", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Count of Time Off Request Events", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Count of Leave of Absence Requests", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Number of created Reference Letters", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Payroll Payments Issued for the U.S.", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Number of Active Employees with a Collective Agreement assignment", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Inactive Leaves - All employees that are on leave and are on inactive status.", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Custom reports run: Composite", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Custom reports run: Matrix", unit: "#", target: null, agg: "average", regions: ["IHR"] },
      { name: "Custom reports run: Advanced", unit: "#", target: null, agg: "average", regions: ["IHR"] },
    ],
  },
];

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function getCategories(): string[] {
  return CATEGORY_DEFS.map((d) => d.cat);
}

export function getOwners(): string[] {
  return [...new Set(CATEGORY_DEFS.map((d) => d.owner))];
}

export function getRegions(): string[] {
  return [...new Set(CATEGORY_DEFS.flatMap((d) => d.metrics.flatMap((m) => m.regions)))];
}

export function getMetricDef(category: string, metric: string): MetricDef | null {
  const d = CATEGORY_DEFS.find((x) => x.cat === category);
  if (!d) return null;
  return d.metrics.find((m) => m.name === metric) ?? null;
}

// KPI section spec for the Leadership summary view — ported from
// `buildKpiSections()` in the prototype. Each tile combines one or more raw
// metrics (see `metrics`) and rolls them up with `ytdAgg` for the YTD view.
export interface KpiTileSpec {
  label: string;
  category: string;
  metrics: string[];
  ytdAgg: AggType;
}
export interface KpiSectionSpec {
  title: string;
  tiles: KpiTileSpec[];
}

export const KPI_SECTIONS: KpiSectionSpec[] = [
  {
    title: "Projects and enhancements",
    tiles: [
      { label: "Total Completed Projects (Yokoten)", category: "Project and Sprints", metrics: ["# Total Completed Projects from the Yokoten  Projects list"], ytdAgg: "sum" },
      { label: "Total Completed Projects (Non-Yokoten)", category: "Project and Sprints", metrics: ["# Total Completed Projects not from the Yokoten Projects list"], ytdAgg: "sum" },
      { label: "Enhancements in the Sprint", category: "Project and Sprints", metrics: ["# of enhancements in the Sprint"], ytdAgg: "sum" },
      { label: "Business Efficiency External Cost Saving", category: "Project and Sprints", metrics: ["Business efficiency External cost saving (hours per year) for Projects and Enhancements"], ytdAgg: "sum" },
    ],
  },
  {
    title: "Workday Usage",
    tiles: [
      { label: "Workday Users", category: "Workday usage/Company Statistics", metrics: ["Workday users"], ytdAgg: "average" },
      { label: "Unique Users That Logged On", category: "Workday usage/Company Statistics", metrics: ["Unique users that logged one"], ytdAgg: "average" },
      { label: "Logon Sessions", category: "Workday usage/Company Statistics", metrics: ["Logon sessions"], ytdAgg: "average" },
      { label: "ESS Initiated Transactions", category: "Wordday usage /Self Service", metrics: ["# ESS initiated  transactions"], ytdAgg: "average" },
    ],
  },
  {
    title: "Data and Analytics",
    tiles: [
      { label: "Total Completed Requests", category: "Reporting and Analytics", metrics: ["# Total Completed Requests"], ytdAgg: "sum" },
      { label: "% Meeting SLA", category: "Reporting and Analytics", metrics: ["% Meeting SLA"], ytdAgg: "average" },
      { label: "Run Counts - CR Reports", category: "Reporting and Analytics", metrics: ["Run Counts - CR Reports"], ytdAgg: "average" },
      { label: "Run Counts - My Org Overview Dashboard", category: "Reporting and Analytics", metrics: ["Run Counts - My Org Overview Dashboard"], ytdAgg: "average" },
      { label: "Run Counts - Ad-hoc Reports", category: "Reporting and Analytics", metrics: ["Run Counts - Ad-hoc Reports"], ytdAgg: "average" },
    ],
  },
  {
    title: "Operations",
    tiles: [
      { label: "Open (New) Tickets", category: "Operations", metrics: ["# of open (new) Ticket"], ytdAgg: "sum" },
      { label: "Closed Tickets", category: "Operations", metrics: ["# of closed Ticket"], ytdAgg: "sum" },
      { label: "Open Remediation / Breakfix", category: "Operations", metrics: ["# Open Remediation/ Breakfix "], ytdAgg: "sum" },
      { label: "% Meeting SLA (IHR)", category: "Operations", metrics: ["SLA - IHR"], ytdAgg: "average" },
      { label: "RFW + Answers", category: "Operations", metrics: ["RFW", "Answers"], ytdAgg: "sum" },
    ],
  },
  {
    title: "Core and Cross Applications",
    tiles: [
      { label: "Active Companies", category: "Core & Cross Applications", metrics: ["Active Companies"], ytdAgg: "average" },
      { label: "Active Supervisory Organizations", category: "Core & Cross Applications", metrics: ["Active supervisory organizations"], ytdAgg: "average" },
      { label: "HCM Integration Events", category: "Core & Cross Applications", metrics: ["HCM Integration events"], ytdAgg: "average" },
      { label: "HCM Cloud Integration Systems", category: "Core & Cross Applications", metrics: ["HCM Cloud Integration Systems"], ytdAgg: "average" },
      { label: "HCM Core Connector Worker Integration Events", category: "Core & Cross Applications", metrics: ["HCM Core Connector Worker Integration events"], ytdAgg: "average" },
    ],
  },
];

// Categories excluded from the Highlights (risers/decliners/target-misses)
// computation, per the prototype's `buildHighlightSourceCards()`.
export const HIGHLIGHT_EXCLUDED_CATEGORIES = ["Customer Satisfaction Survey", "HR Training by HRIS"];

export const REPORT_RUN_METRIC_NAMES = ["Run Counts - CR Reports", "Run Counts - My Org Overview Dashboard", "Run Counts - Ad-hoc Reports"];
