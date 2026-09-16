-- CreateTable
CREATE TABLE "MetricEntry" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryAccess" (
    "category" TEXT NOT NULL,
    "emails" TEXT[],

    CONSTRAINT "CategoryAccess_pkey" PRIMARY KEY ("category")
);

-- CreateTable
CREATE TABLE "AppMeta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "AppMeta_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "MetricEntry_year_month_idx" ON "MetricEntry"("year", "month");

-- CreateIndex
CREATE INDEX "MetricEntry_category_idx" ON "MetricEntry"("category");

-- CreateIndex
CREATE UNIQUE INDEX "MetricEntry_category_metric_owner_region_year_month_key" ON "MetricEntry"("category", "metric", "owner", "region", "year", "month");
