import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  const [rows, meta] = await Promise.all([
    prisma.metricEntry.findMany({
      select: { category: true, metric: true, owner: true, unit: true, region: true, year: true, month: true, value: true },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    }),
    prisma.appMeta.findUnique({ where: { key: "lastUpdated" } }),
  ]);

  return NextResponse.json({ rows, lastUpdated: meta?.value ?? null });
}
