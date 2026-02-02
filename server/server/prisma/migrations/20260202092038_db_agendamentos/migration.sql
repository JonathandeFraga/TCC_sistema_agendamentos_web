-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servico" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "duracao" INTEGER NOT NULL,

    CONSTRAINT "Servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" SERIAL NOT NULL,
    "datetime" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_profissional" INTEGER NOT NULL,
    "id_servico" INTEGER NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);
