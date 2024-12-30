/*
  Warnings:

  - You are about to drop the `RevokedToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "RevokedToken";

-- CreateTable
CREATE TABLE "revoked_token" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revoked_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "revoked_token_token_key" ON "revoked_token"("token");
