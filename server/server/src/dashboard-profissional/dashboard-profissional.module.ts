import { Module } from '@nestjs/common';
import { DashboardProfissionalController } from './dashboard-profissional.controller';
import { DashboardProfissionalService } from './dashboard-profissional.service';
import { PrismaService } from 'src/database/prisma.service';
import { ProfissionalGuard } from 'src/auth/profissional.guard';

@Module({
    controllers: [DashboardProfissionalController],
    providers: [DashboardProfissionalService, PrismaService, ProfissionalGuard]
})
export class DashboardProfissionalModule {}
