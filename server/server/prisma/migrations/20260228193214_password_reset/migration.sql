/*
  Warnings:

  - You are about to drop the `PasswordReset` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PasswordReset";

-- CreateTable
CREATE TABLE "passwordReset" (
    "id" SERIAL NOT NULL,
    "tipo" "PasswordResetType" NOT NULL,
    "fone" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passwordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "passwordReset_tipo_fone_idx" ON "passwordReset"("tipo", "fone");

-- CreateIndex
CREATE INDEX "passwordReset_tokenHash_idx" ON "passwordReset"("tokenHash");
