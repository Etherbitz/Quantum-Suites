/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `websitesUsed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Scan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_userId_fkey";

-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_websiteId_fkey";

-- DropForeignKey
ALTER TABLE "ScanJob" DROP CONSTRAINT "ScanJob_websiteId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "ScanJob" ADD COLUMN     "results" JSONB,
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "summary" JSONB,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "websiteId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt",
DROP COLUMN "websitesUsed";

-- DropTable
DROP TABLE "Scan";

-- CreateIndex
CREATE INDEX "ScanJob_userId_idx" ON "ScanJob"("userId");

-- CreateIndex
CREATE INDEX "ScanJob_websiteId_idx" ON "ScanJob"("websiteId");

-- CreateIndex
CREATE INDEX "ScanJob_status_idx" ON "ScanJob"("status");

-- AddForeignKey
ALTER TABLE "ScanJob" ADD CONSTRAINT "ScanJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanJob" ADD CONSTRAINT "ScanJob_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE SET NULL ON UPDATE CASCADE;
