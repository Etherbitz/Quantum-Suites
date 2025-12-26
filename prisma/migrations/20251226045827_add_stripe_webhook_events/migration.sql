-- CreateTable
CREATE TABLE "ScanExecutionLog" (
    "id" TEXT NOT NULL,
    "scanJobId" TEXT NOT NULL,
    "userId" TEXT,
    "phase" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertAudit" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scanJobId" TEXT,
    "dropThreshold" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "previousScore" INTEGER NOT NULL,
    "currentScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScanExecutionLog_scanJobId_idx" ON "ScanExecutionLog"("scanJobId");

-- CreateIndex
CREATE INDEX "ScanExecutionLog_userId_idx" ON "ScanExecutionLog"("userId");

-- CreateIndex
CREATE INDEX "ScanExecutionLog_createdAt_idx" ON "ScanExecutionLog"("createdAt");

-- CreateIndex
CREATE INDEX "AlertAudit_alertId_idx" ON "AlertAudit"("alertId");

-- CreateIndex
CREATE INDEX "AlertAudit_userId_idx" ON "AlertAudit"("userId");

-- CreateIndex
CREATE INDEX "AlertAudit_scanJobId_idx" ON "AlertAudit"("scanJobId");

-- CreateIndex
CREATE INDEX "AlertAudit_createdAt_idx" ON "AlertAudit"("createdAt");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_type_idx" ON "StripeWebhookEvent"("type");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_createdAt_idx" ON "StripeWebhookEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "ScanExecutionLog" ADD CONSTRAINT "ScanExecutionLog_scanJobId_fkey" FOREIGN KEY ("scanJobId") REFERENCES "ScanJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanExecutionLog" ADD CONSTRAINT "ScanExecutionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertAudit" ADD CONSTRAINT "AlertAudit_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "ComplianceAlert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertAudit" ADD CONSTRAINT "AlertAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertAudit" ADD CONSTRAINT "AlertAudit_scanJobId_fkey" FOREIGN KEY ("scanJobId") REFERENCES "ScanJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
