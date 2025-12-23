/*
  Warnings:

  - The `status` column on the `ScanJob` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "ScanJob" DROP COLUMN "status",
ADD COLUMN     "status" "ScanStatus" NOT NULL DEFAULT 'QUEUED';

-- CreateIndex
CREATE INDEX "ScanJob_status_idx" ON "ScanJob"("status");
