/*
  Warnings:

  - You are about to drop the column `custo` on the `servicos` table. All the data in the column will be lost.
  - Added the required column `custoCent` to the `servicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duracaoMin` to the `servicos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('AGENDADO', 'CONCLUIDO', 'CANCELADO');

-- AlterTable
ALTER TABLE "servicos" DROP COLUMN "custo",
ADD COLUMN     "custoCent" INTEGER NOT NULL,
ADD COLUMN     "duracaoMin" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "profissionalId" INTEGER NOT NULL,
    "servicoId" INTEGER NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'AGENDADO',
    "custoCentSnap" INTEGER NOT NULL,
    "duracaoMinSnap" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "caceledAt" TIMESTAMP(3),
    "concludedAt" TIMESTAMP(3),

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feriados" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "nome" TEXT,

    CONSTRAINT "feriados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agendamentos_clienteId_inicio_idx" ON "agendamentos"("clienteId", "inicio");

-- CreateIndex
CREATE INDEX "agendamentos_status_inicio_idx" ON "agendamentos"("status", "inicio");

-- CreateIndex
CREATE INDEX "agendamentos_servicoId_inicio_idx" ON "agendamentos"("servicoId", "inicio");

-- CreateIndex
CREATE UNIQUE INDEX "feriados_data_key" ON "feriados"("data");

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "loginCliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "loginProfissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
