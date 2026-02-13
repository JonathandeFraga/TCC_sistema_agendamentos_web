import { Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfissionalGuard } from 'src/auth/profissional.guard';
import { DashboardProfissionalService } from './dashboard-profissional.service';
import { QueryRangeDto } from './dto/query-range.dto';

@UseGuards(AuthGuard('jwt'), ProfissionalGuard)
@Controller('profissional')
export class DashboardProfissionalController {
    constructor(private readonly svc: DashboardProfissionalService) {}

    @Get('agenda')
    book(@Query() q: QueryRangeDto) {
        return this.svc.agenda(q.from, q.to);
    }

    @Get('kpis')
    kpis() {
        return this.svc.resumoKPIs();
    }

    @Get('metricas/agendamentos-por-dia')
    appointmentsByDay() {
        return this.svc.agendamentosPorDiaSemana();
    }

    @Get('metricas/servicos-populares')
    popularServices(@Query() q: QueryRangeDto) {
        return this.svc.servicosMaisPopulares(q.from, q.to);
    }

    @Get('metricas/receita-mensal')
    revenue(@Query('year') year?: string) {
        return this.svc.receitaMensal(year ? Number(year) : undefined);
    }

    @Post('agendamentos/:id/concluir')
    conclude(@Param('id', ParseIntPipe) id: number) {
        return this.svc.concluirAgendamento(id);
    }

    @Post('agendamentos/:id/cancelar')
    cancel(@Param('id', ParseIntPipe) id: number) {
        return this.svc.cancelarAgendamento(id);
    }
}
