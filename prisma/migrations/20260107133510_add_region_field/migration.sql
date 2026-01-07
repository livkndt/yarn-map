-- AlterTable
ALTER TABLE "events" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "region" TEXT;

-- CreateIndex
CREATE INDEX "events_region_idx" ON "events"("region");

-- CreateIndex
CREATE INDEX "shops_region_idx" ON "shops"("region");
