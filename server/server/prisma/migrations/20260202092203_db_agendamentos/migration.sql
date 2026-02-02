/*
  Warnings:

  - You are about to drop the `Agendamento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Servico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Agendamento";

-- DropTable
DROP TABLE "Servico";

-- DropTable
DROP TABLE "Usuario";

-- CreateTable
CREATE TABLE "loginProfissional" (
    "id" SERIAL NOT NULL,
    "fone" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "loginProfissional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loginCliente" (
    "id" SERIAL NOT NULL,
    "fone" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "loginCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "custo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);
