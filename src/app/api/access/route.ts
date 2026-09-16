import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { getCategories } from "@/lib/categoryDefs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const access = await prisma.categoryAccess.findMany();
  const byCategory = new Map(access.map((a) => [a.category, a.emails]));
  const rows = getCategories().map((category) => ({ category, emails: byCategory.get(category) ?? [] }));
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: { category?: string; emails?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { category, emails } = body;
  if (!category || !Array.isArray(emails)) {
    return NextResponse.json({ error: "category and emails are required" }, { status: 400 });
  }
  if (!getCategories().includes(category)) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  const cleaned = [...new Set(emails.map((e) => String(e).trim().toLowerCase()).filter(Boolean))];

  const row = await prisma.categoryAccess.upsert({
    where: { category },
    update: { emails: cleaned },
    create: { category, emails: cleaned },
  });

  return NextResponse.json({ category: row.category, emails: row.emails });
}
