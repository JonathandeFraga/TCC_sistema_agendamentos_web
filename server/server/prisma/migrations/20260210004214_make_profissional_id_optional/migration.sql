/*
  Warnings:

  - You are about to drop the column `caceledAt` on the `agendamentos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "agendamentos" DROP COLUMN "caceledAt",
ADD COLUMN     "canceledAt" TIMESTAMP(3);
