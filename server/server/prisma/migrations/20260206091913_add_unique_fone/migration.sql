/*
  Warnings:

  - A unique constraint covering the columns `[fone]` on the table `loginCliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fone]` on the table `loginProfissional` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "loginCliente_fone_key" ON "loginCliente"("fone");

-- CreateIndex
CREATE UNIQUE INDEX "loginProfissional_fone_key" ON "loginProfissional"("fone");
