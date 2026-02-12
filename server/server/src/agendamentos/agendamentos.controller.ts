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

    @Get('disponibilidade/dias')
    dias(
        @Query('servicoId', ParseIntPipe) servicoId: number,
        @Query('mes') mes: string,
    ) {
        return this.svc.disponibilidadeDias(servicoId, mes);
    }

    @Get('disponibilidade/horarios')
    horarios(
        @Query('servicoId', ParseIntPipe) servicoId: number,
        @Query('data') data: string,
    ) {
        return this.svc.disponibilidadeHorarios(servicoId, data);
    }

    @UseGuards(AuthGuard('jwt'), ClienteGuard)
    @Post('')
    criar(@Req() req: any, @Body() dto: CreateBookingDto) {
        return this.svc.criarAgendamento(req.user.userId, dto);
    }

    @UseGuards(AuthGuard('jwt'), ClienteGuard)
    @Get('me')
    meus(@Req() req: any) {
        return this.svc.meusAgendamentos(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'), ClienteGuard)
    @Post(':id/cancelar')
    cancelar(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.svc.cancelar(req.user.userId, id);
    }

    @UseGuards(AuthGuard('jwt'), ProfissionalGuard)
    @Post(':id/concluir')
    concluir(@Param('id', ParseIntPipe) id: number) {
        return this.svc.concluir(id);
    }
}
