import { Module } from '@nestjs/common';
import { AgendamentosController } from './agendamentos.controller';
import { AgendamentosService } from './agendamentos.service';
import { PrismaService } from 'src/database/prisma.service';
import { ClienteGuard } from 'src/auth/cliente.guard';
import { ProfissionalGuard } from 'src/auth/profissional.guard';

@Module({
    controllers: [AgendamentosController],
    providers: [AgendamentosService, PrismaService, ClienteGuard, ProfissionalGuard],
})
export class AgendamentosModule {}
