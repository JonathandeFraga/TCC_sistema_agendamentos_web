import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { DateTime } from 'luxon';
import { CreateBookingDto } from './dto/create-booking.dto';
import { exists } from 'fs';

const TZ = 'America/Sao_Paulo';

const WINDOWS = [
    { start: { h: 8, m: 0 }, end: { h: 12, m: 0 } },
    { start: { h: 14, m: 0 }, end: { h: 18, m: 0 } },
];

@Injectable()
export class AgendamentosService {
    constructor(private readonly prisma: PrismaService) {}

    private parseLocalStart(data: string, hora: string) {
        const [y, mo, d] = data.split('-').map(Number);
        const [hh, mm] = hora.split(':').map(Number);
        const dt = DateTime.fromObject(
            { year: y, month: mo, day: d, hour: hh, minute: mm, second: 0, millisecond: 0 },
            { zone: TZ },
        );
        if (!dt.isValid) throw new BadRequestException('Data/hora inválida');
        return dt;
    }

    private isWithinWindows(start: DateTime, end: DateTime): boolean {
        return WINDOWS.some((w) => {
            const ws = start.set({ hour: w.start.h, minute: w.start.m, second: 0, millisecond: 0 });
            const we = start.set({ hour: w.end.h, minute: w.end.m, second: 0, millisecond: 0 });
            return start >= we && end <= we;
        });
    }

    private async isHoliday(localDate: DateTime): Promise<boolean> {
        const dateOnly = localDate.toISODate();

        const rows = await this.prisma.$queryRaw<Array<{ exists: boolean }>>`
            SELECT EXISTS (
                SELECT 1 FROM "feriados" f WHERE f."data" = ${dateOnly}::date
            ) as "exists"
        `;
        return rows[0]?.exists ?? false;
    }

    async listServicos() {
        return this.prisma.servicos.findMany({
            orderBy: { nome: 'asc' },
            select: { id: true, nome: true, custoCent: true, duracaoMin: true, descricao: true },
        });
    }

    async disponibilidadeDias(servicoId: number, mes: string) {
        const servico = await this.prisma.servicos.findUnique({
            where: { id: servicoId },
            select: { id: true },
        });
        if (!servico) throw new NotFoundException('Serviço não encontrado');

        const  [y, m] = mes.split('-').map(Number);
        const first = DateTime.fromObject({ year: y, month: m, day: 1 }, { zone: TZ }).startOf('day');
        if (!first.isValid) throw new BadRequestException('Mês inválido');

        const daysInMonth = first.daysInMonth;
        const result: Array<{ date: string; available: boolean }> = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = first.set({ day }).startOf('day');
            const weekday = date.weekday;

            if (weekday === 1 || weekday === 7) {
                result.push({ date: date.toISODate()!, available: false });
                continue;
            }
            if (await this.isHoliday(date)) {
                result.push({ date: date.toISODate()!, available: false });
                continue;
            }

            const times = await this.disponibilidadeHorarios(servicoId, date.toISODate()!);
            result.push({ date: date.toISODate()!, available: times.length > 0 });
        }

        return result;
    }

    async disponibilidadeHorarios(servicoId: number, data: string) {
        const servico = await this.prisma.servicos.findUnique({
            where: { id: servicoId },
            select: { duracaoMin: true },
        });
        if (!servico) throw new NotFoundException('Serviço não encontrado');

        const date = DateTime.fromISO(data, { zone: TZ }).startOf('day');
        if (!date.isValid) throw new BadRequestException('Data inválida');

        const weekday = date.weekday;
        if (weekday === 1 || weekday === 7) return [];
        if (await this.isHoliday(date)) return [];

        const stepMin = 15;
        
        const dayStartUtc = date.toUTC().toJSDate();
        const dayEndUtc = date.plus({ days: 1 }).toUTC().toJSDate();
        
        const bookings = await this.prisma.agendamentos.findMany({
            where: {
                status: 'AGENDADO',
                inicio: { gte: dayStartUtc, lt: dayEndUtc },
            },
            select: { inicio: true, fim: true },
        });

        const available: string[] = [];
        const now = DateTime.now().setZone(TZ);

        for (const w of WINDOWS) {
            let cursor = date.set({ hour: w.start.h, minute: w.start.m, second: 0, millisecond: 0 });
            const windowEnd = date.set({ hour: w.end.h, minute: w.end.m, second: 0, millisecond: 0 });

            while (cursor < windowEnd) {
                const start = cursor;
                const end = start.plus({ minutes: servico.duracaoMin });

                if (end > windowEnd) break;

                if (start < now) {
                    cursor = cursor.plus({ minutes: stepMin });
                    continue;
                }

                const hasConflict = bookings.some((b) => {
                    const bi = DateTime.fromJSDate(b.inicio).setZone(TZ);
                    const bf = DateTime.fromJSDate(b.fim).setZone(TZ);
                    return start < bf && end > bi;
                });

                if (!hasConflict) available.push(start.toFormat('HH:mm'));
                cursor = cursor.plus({ minutes:stepMin });
            }
        }

        return available;
    }

    async criarAgendamento(clienteId: number, dto: CreateBookingDto) {
        const servico = await this.prisma.servicos.findUnique({
            where: { id: dto.servicoId },
            select: { id: true, duracaoMin: true, custoCent: true },
        });
        if (!servico) throw new NotFoundException('Serviço não encontrado');

        const startLocal = this.parseLocalStart(dto.data, dto.hora);
        const endLocal = startLocal.plus({ minutes: servico.duracaoMin });

        const weekday = startLocal.weekday;
        if (weekday === 1 || weekday === 7) throw new BadRequestException('Sem agendamentos em doming/segunda');
        if (await this.isHoliday(startLocal)) throw new BadRequestException('Sem agendamentos em feriados');

        if (!this.isWithinWindows(startLocal, endLocal)) {
            throw new BadRequestException('Horário fora do atendimento (08-12, 14-18)');
        }

        const inicioUtc = startLocal.toUTC().toJSDate();
        const fimUtc = endLocal.toUTC().toJSDate();

        return this.prisma.$transaction(async (tx) => {
            const conflict = await tx.agendamentos.findFirst({
                where: {
                    status: 'AGENDADO',
                    AND: [{ inicio: { lt: fimUtc } }, { fim: { gt: inicioUtc } }],
                },
                select: { id:true },
            });
            if (conflict) throw new ConflictException('Horário indisponível');

            return tx.agendamentos.create({
                data: {
                    clienteId,
                    servicoId: servico.id,
                    inicio: inicioUtc,
                    fim: fimUtc,
                    status: 'AGENDADO',
                    custoCentSnap: servico.custoCent,
                    duracaoMinSnap: servico.duracaoMin,
                },
                select: { id: true, inicio: true, fim: true, status: true },
            });
        });
    }

    async meusAgendamentos(clienteId: number) {
        return this.prisma.agendamentos.findMany({
            where: { clienteId },
            orderBy: { inicio: 'asc' },
            select: {
                id: true,
                status: true,
                inicio: true,
                fim: true,
                servico: { select: { id: true, nome: true, duracaoMin: true, custoCent: true } },
            },
        });
    }

    async cancelar(clienteId: number, bookingId: number) {
        const booking = await this.prisma.agendamentos.findFirst({
            where: { id: bookingId, clienteId },
            select: { id: true, status: true, inicio: true },
        });

        if (!booking) throw new NotFoundException('Agendamento não encontrado');
        if (booking.status !== 'AGENDADO') throw new BadRequestException('Apenas agendamentos ativos podem ser cancelados');

        const startLocal = DateTime.fromJSDate(booking.inicio).setZone(TZ);
        const diffMin = startLocal.diff(DateTime.now().setZone(TZ), 'minutes').minutes;

        if (diffMin < 60) throw new ForbiddenException('Cancelamento somente com 1h de antecedência');

        return this.prisma.agendamentos.update({
            where: { id: bookingId },
            data: { status: 'CANCELADO', canceledAt: new Date() },
            select: { id: true, status: true },
        });
    }

    async concluir(bookingId: number) {
        const booking = await this.prisma.agendamentos.findUnique({
            where: { id: bookingId },
            select: { id: true, status: true },
        });

        if(!booking) throw new NotFoundException('Agendamento não encontrado');
        if (booking.status !== 'AGENDADO') throw new BadRequestException('Apenas agendamentos ativos podem ser concluídos');

        return this.prisma.agendamentos.update({
            where: { id: bookingId },
            data: { status: 'CONCLUIDO', concludedAt: new Date() },
            select: { id: true, status: true },
        });
    }
}
