"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/categoryDefs";
import { DEFAULT_FILTERS, type Filters, type MetricRow } from "@/lib/metricsEngine";
import { colors, fontFamily } from "@/lib/theme";
import Header from "./Header";
import FiltersBar from "./FiltersBar";
import LeadershipView from "./LeadershipView";
import DepartmentView from "./DepartmentView";
import EnterData from "./EnterData";

export interface SessionUser {
  email: string;
  name: string | null;
  isAdmin: boolean;
  editableCategories: string[];
}

export default function DashboardApp({ user }: { user: SessionUser }) {
  const [tab, setTab] = useState<"dashboard" | "entry">("dashboard");
  const [audienceView, setAudienceView] = useState<"leadership" | "department">("leadership");
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);
  const [allData, setAllData] = useState<MetricRow[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () =>
    fetch("/api/metrics")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load metrics (" + r.status + ")");
        return r.json();
      })
      .then((data) => {
        setAllData(data.rows);
        setLastUpdated(data.lastUpdated);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchData();
  }, []);

  const setFilters = (patch: Partial<Filters>) => setFiltersState((f) => ({ ...f, ...patch }));

  return (
    <div style={{ minHeight: "100vh", background: colors.pageBg, fontFamily, color: colors.textPrimary }}>
      <Header lastUpdated={lastUpdated} tab={tab} setTab={setTab} userEmail={user.email} isAdmin={user.isAdmin} />

      {loading && <div style={{ padding: 40, textAlign: "center", color: colors.textTertiary }}>Loading…</div>}
      {error && <div style={{ padding: 40, textAlign: "center", color: colors.negative }}>{error}</div>}

      {!loading && !error && tab === "dashboard" && (
        <div>
          <FiltersBar filters={filters} setFilters={setFilters} categories={getCategories()} audienceView={audienceView} setAudienceView={setAudienceView} />
          {audienceView === "leadership" ? <LeadershipView allData={allData} filters={filters} /> : <DepartmentView allData={allData} filters={filters} />}
        </div>
      )}

      {!loading && !error && tab === "entry" && <EnterData allData={allData} user={user} onSaved={fetchData} />}
    </div>
  );
}
