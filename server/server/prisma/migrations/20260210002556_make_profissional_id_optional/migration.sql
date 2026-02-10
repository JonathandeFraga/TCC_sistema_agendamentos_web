-- DropForeignKey
ALTER TABLE "agendamentos" DROP CONSTRAINT "agendamentos_profissionalId_fkey";

-- AlterTable
ALTER TABLE "agendamentos" ALTER COLUMN "profissionalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "loginProfissional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
