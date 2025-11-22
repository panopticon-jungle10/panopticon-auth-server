/*
  Warnings:

  - You are about to drop the column `SloPolicies` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "SloPolicies";

-- CreateTable
CREATE TABLE "SloPolicy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "availabilityTarget" DOUBLE PRECISION DEFAULT 99.9,
    "latencyTargetMs" DOUBLE PRECISION DEFAULT 200,
    "errorRateTarget" DOUBLE PRECISION DEFAULT 1.0,
    "availabilityEnabled" BOOLEAN NOT NULL DEFAULT true,
    "latencyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "errorRateEnabled" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SloPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SloWebhookMapping" (
    "id" TEXT NOT NULL,
    "sloId" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SloWebhookMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPassword" TEXT,
    "smtpTls" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastTestedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SloPolicy_userId_idx" ON "SloPolicy"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SloPolicy_userId_serviceName_name_key" ON "SloPolicy"("userId", "serviceName", "name");

-- CreateIndex
CREATE INDEX "SloWebhookMapping_sloId_idx" ON "SloWebhookMapping"("sloId");

-- CreateIndex
CREATE INDEX "SloWebhookMapping_webhookId_idx" ON "SloWebhookMapping"("webhookId");

-- CreateIndex
CREATE UNIQUE INDEX "SloWebhookMapping_sloId_webhookId_key" ON "SloWebhookMapping"("sloId", "webhookId");

-- CreateIndex
CREATE INDEX "WebhookConfig_userId_idx" ON "WebhookConfig"("userId");

-- AddForeignKey
ALTER TABLE "SloPolicy" ADD CONSTRAINT "SloPolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SloWebhookMapping" ADD CONSTRAINT "SloWebhookMapping_sloId_fkey" FOREIGN KEY ("sloId") REFERENCES "SloPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SloWebhookMapping" ADD CONSTRAINT "SloWebhookMapping_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "WebhookConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookConfig" ADD CONSTRAINT "WebhookConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
