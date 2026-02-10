import { Controller, Body, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgendamentosService } from './agendamentos.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryMesDto } from './dto/query-mes.dto';
import { QueryDiaDto } from './dto/query-dia.dto';
import { ClienteGuard } from 'src/auth/cliente.guard';
import { ProfissionalGuard } from 'src/auth/profissional.guard';

@Controller('agendamentos')
export class AgendamentosController {
    constructor(private readonly svc: AgendamentosService) {}

    @Get('servicos')
    listServicos() {
        return this.svc.listServicos();
    }

    @Get('agendamentos/disponibilidade/dias')
    dias(@Query() q: QueryMesDto) {
        return this.svc.disponibilidadeDias(Number(q.servicoId), q.mes);
    }

    @Get('agendamentos/disponibilidade/horarios')
    horarios(@Query() q: QueryDiaDto) {
        return this.svc.disponibilidadeHorarios(Number(q.servicoId), q.data);
    }

    @UseGuards(AuthGuard('jwt'), ClienteGuard)
    @Post('agendamentos')
    criar(@Req() req: any, @Body() dto: CreateBookingDto) {
        return this.svc.criarAgendamento(req.user.userId, dto);
    }

    @UseGuards(AuthGuard('jwt'), ClienteGuard)
    @Get('agendamentos/me')
    meus(@Req() req: any) {
        return this.svc.meusAgendamentos(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'), ClienteGuard)
    @Post('agendamentos/:id/cancelar')
    cancelar(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.svc.cancelar(req.user.userId, id);
    }

    @UseGuards(AuthGuard('jwt'), ProfissionalGuard)
    @Post('agendamentos/:id/concluir')
    concluir(@Param('id', ParseIntPipe) id: number) {
        return this.svc.concluir(id);
    }
}
