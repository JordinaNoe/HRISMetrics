// Seeds the database with the sample/historical data shipped in the design
// handoff (`hr-metrics-data.js` -> fixtures/hr-metrics-seed.json) and the
// category -> editor-email map. Safe to re-run: it upserts.
import { PrismaClient } from "@prisma/client";
import { CATEGORY_DEFS, getMetricDef } from "../src/lib/categoryDefs";
import seedData from "./fixtures/hr-metrics-seed.json";

const prisma = new PrismaClient();

interface SeedRow {
  category: string;
  owner: string;
  metric: string;
  unit?: string;
  region: string;
  year: number;
  month: number;
  value: number;
}

async function main() {
  const rows = seedData.rows as SeedRow[];

  console.log(`Seeding ${rows.length} metric rows...`);
  for (const row of rows) {
    // A handful of fixture rows omit `unit` — fall back to the category's
    // metric definition, which is the source of truth for units anyway.
    const unit = row.unit ?? getMetricDef(row.category, row.metric)?.unit ?? "#";
    await prisma.metricEntry.upsert({
      where: {
        category_metric_owner_region_year_month: {
          category: row.category,
          metric: row.metric,
          owner: row.owner,
          region: row.region,
          year: row.year,
          month: row.month,
        },
      },
      update: { value: row.value, unit },
      create: { ...row, unit },
    });
  }

  await prisma.appMeta.upsert({
    where: { key: "lastUpdated" },
    update: { value: seedData.lastUpdated },
    create: { key: "lastUpdated", value: seedData.lastUpdated },
  });

  // Seed default category -> editor-email access using a best-guess
  // firstname.lastname@<domain> pattern from each category's named owner.
  // An admin should verify/correct these on the Admin > Access page before
  // relying on them for real access control.
  const domain = process.env.ALLOWED_EMAIL_DOMAIN || "example.com";
  for (const def of CATEGORY_DEFS) {
    const guessedEmail = def.owner.trim().toLowerCase().split(/\s+/).join(".") + "@" + domain;
    await prisma.categoryAccess.upsert({
      where: { category: def.cat },
      update: {},
      create: { category: def.cat, emails: [guessedEmail] },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
