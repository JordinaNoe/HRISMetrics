import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/apiAuth";
import { CATEGORY_DEFS } from "@/lib/categoryDefs";

interface EntryInput {
  metric: string;
  region: string;
  value: number;
}

interface RequestBody {
  category: string;
  year: number;
  month: number;
  entries: EntryInput[];
}

function formatLastUpdated(d: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(d);
}

export async function POST(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { category, year, month, entries } = body;
  if (!category || !year || !month || !Array.isArray(entries)) {
    return NextResponse.json({ error: "category, year, month, and entries are required" }, { status: 400 });
  }

  const canEdit = session.user.isAdmin || session.user.editableCategories?.includes(category);
  if (!canEdit) {
    return NextResponse.json({ error: "You don't have permission to enter data for this category" }, { status: 403 });
  }

  const def = CATEGORY_DEFS.find((d) => d.cat === category);
  if (!def) return NextResponse.json({ error: "Unknown category" }, { status: 400 });

  if (year < 2000 || year > 2100 || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid year/month" }, { status: 400 });
  }

  const results = [];
  for (const entry of entries) {
    const metricDef = def.metrics.find((m) => m.name === entry.metric);
    if (!metricDef || !metricDef.regions.includes(entry.region)) continue;
    if (typeof entry.value !== "number" || Number.isNaN(entry.value)) continue;

    const row = await prisma.metricEntry.upsert({
      where: {
        category_metric_owner_region_year_month: {
          category: def.cat,
          metric: metricDef.name,
          owner: def.owner,
          region: entry.region,
          year,
          month,
        },
      },
      update: { value: entry.value, unit: metricDef.unit, updatedBy: session.user.email },
      create: { category: def.cat, owner: def.owner, metric: metricDef.name, unit: metricDef.unit, region: entry.region, year, month, value: entry.value, updatedBy: session.user.email },
    });
    results.push(row);
  }

  if (!results.length) {
    return NextResponse.json({ error: "No valid entries to save" }, { status: 400 });
  }

  const lastUpdated = formatLastUpdated(new Date());
  await prisma.appMeta.upsert({ where: { key: "lastUpdated" }, update: { value: lastUpdated }, create: { key: "lastUpdated", value: lastUpdated } });

  return NextResponse.json({ saved: results.length, lastUpdated });
}
