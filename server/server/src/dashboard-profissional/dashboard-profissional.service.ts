import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { DateTime } from 'luxon';

const TZ = 'America/Sao_Paulo';

function parseRange(from?: string, to?: string) {
    const now = DateTime.now().setZone(TZ);
    const start = from
        ? DateTime.fromISO(from, { zone: TZ }).startOf('day')
        : now.startOf('week');
    const end = to
        ? DateTime.fromISO(to, { zone: TZ }).endOf('day')
        : now.endOf('week');

    return {
        startLocal: start,
        endLocal: end,
        startUtc: start.toUTC().toJSDate(),
        endUtc: end.toUTC().toJSDate(),
    };
}

@Injectable()
export class DashboardProfissionalService {
    constructor(private readonly prisma: PrismaService) {}

    async agenda(from?: string, to?: string) {
        const { startUtc, endUtc } = parseRange(from, to);

        return this.prisma.agendamentos.findMany({
            where: {
                inicio: { gte: startUtc, lte: endUtc },
            },
            orderBy: { inicio: 'asc' },
            select: {
                id: true,
                status: true,
                inicio: true,
                fim: true,
                cliente: { select: { id: true, nome: true, fone: true } },
                servico: { select: { id: true, nome: true, duracaoMin: true, custoCent: true } }
            },
        });
    }

    async resumoKPIs() {
        const now = DateTime.now().setZone(TZ);
        const todayStart = now.startOf('day').toUTC().toJSDate();
        const todayEnd = now.endOf('day').toUTC().toJSDate();

        const monthStart = now.startOf('month').toUTC().toJSDate();
        const monthEnd = now.endOf('month').toUTC().toJSDate();

        const [todayCount, monthRevenueAgg, weekClientsRaw] = await Promise.all([
            this.prisma.agendamentos.count({
                where: {
                    status: 'AGENDADO',
                    inicio: { gte: todayStart, lte: todayEnd }
                },
            }),
            this.prisma.agendamentos.aggregate({
                where: {
                    status: 'CONCLUIDO',
                    inicio: { gte: monthStart, lte: monthEnd },
                },
                _sum: { custoCentSnap: true },
            }),
            this.prisma.agendamentos.findMany({
                where: {
                    inicio: { gte: now.startOf('week').toUTC().toJSDate(), lte: now.endOf('week').toUTC().toJSDate() },
                },
                select: { clienteId: true },
            }),
        ]);

        const weekUniqueClients = new Set(weekClientsRaw.map((x) => x.clienteId)).size;

        return {
            todayAppointments: todayCount, weekUniqueClients,
            monthRevenueCent: monthRevenueAgg._sum.custoCentSnap ?? 0,
        };
    }

    async agendamentosPorDiaSemana() {
        const endLocal = DateTime.now().setZone(TZ).endOf('day');
        const startLocal = endLocal.minus({ days: 6 }).startOf('day');

        const rows = await this.prisma.$queryRaw<Array<{ day: string; count: number; d: string }>>`
            SELECT
                to_char(d, 'DY') AS "day",
                count(*)::int AS "count",
                to_char(d, 'YYYY-MM-DD') AS "d"
            FROM (
                SELECT
                    (((a."inicio" AT TIME ZONE 'UTC') AT TIME ZONE ${TZ})::date) AS d
                FROM "agendamentos" a
                WHERE a."inicio" >= ${startLocal.toUTC().toJSDate()}
                    AND a."inicio" <= ${endLocal.toUTC().toJSDate()}
                    AND a."status" = 'AGENDADO'
            ) x
            GROUP BY d
            ORDER BY d ASC
        `;

        return rows.map((r) => ({ day: r.day.trim(), agendamentos: r.count }));
    }

    async servicosMaisPopulares(from?: string, to?: string) {
        const { startUtc, endUtc } = parseRange(from, to);

        const grouped = await this.prisma.agendamentos.groupBy({
            by: ['servicoId'],
            where: { inicio: { gte: startUtc, lte: endUtc } },
            _count: { servicoId: true },
            orderBy: { _count: { servicoId: 'desc' } },
            take: 8,
        });

        const ids = grouped.map((g) => g.servicoId);
        const servicos = await this.prisma.servicos.findMany({
            where: { id: { in: ids } },
            select: { id: true, nome: true},
        });

        const mapNome = new Map(servicos.map((s) => [s.id, s.nome]));
        const total = grouped.reduce((acc, g) => acc + (g._count.servicoId ?? 0), 0) || 1;

        return grouped.map((g) => ({
            name: mapNome.get(g.servicoId) ?? `Serviço ${g.servicoId}`,
            value: g._count.servicoId ?? 0,
            percent: ((g._count.servicoId ?? 0) / total) * 100,
        }));
    }

    async receitaMensal(year?: number) {
        const y = year ?? DateTime.now().setZone(TZ).year;
        const startLocal = DateTime.fromObject({ year: y, month: 1, day: 1 }, { zone: TZ }).startOf('day');
        const endLocal = startLocal.plus({ years: 1 }).minus({ milliseconds: 1 });

        const rows = await this.prisma.$queryRaw<
            Array<{ month: number; revenueCent: number }>
        >`
            SELECT
                extract(month from (a."inicio" AT TIME ZONE 'UTC' AT TIME ZONE ${TZ}))::int AS "month",
                coalesce(sum(a."custoCentSnap"), 0)::int AS "revenueCent"
            FROM "agendamentos" a
            WHERE a."status" = 'CONCLUIDO'
                AND a."inicio" >= ${startLocal.toUTC().toJSDate()}
                AND a."inicio" <= ${endLocal.toUTC().toJSDate()}
            GROUP BY 1
            ORDER BY 1 ASC
        `;

        const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        const map = new Map(rows.map((r) => [r.month, r.revenueCent]));

        return months.map((label, idx) => ({
            month: label,
            receita: (map.get(idx + 1) ?? 0) / 100,
        }));
    }

    async concluirAgendamento(id: number) {
        const booking = await this.prisma.agendamentos.findUnique({
            where: { id },
            select: { id: true, status: true },
        });
        if (!booking) throw new NotFoundException('Agendamento não encontrado');
        if (booking.status !== 'AGENDADO') return booking;

        return this.prisma.agendamentos.update({
            where: { id },
            data: { status: 'CONCLUIDO', concludedAt: new Date() },
            select: { id: true, status: true },
        });
    }

    async cancelarAgendamento(id: number) {
        const booking = await this.prisma.agendamentos.findUnique({
            where: { id },
            select: { id: true, status: true },
        });
        if (!booking) throw new NotFoundException('Agendamento não encontrado');
        if (booking.status !== 'AGENDADO') return booking;

        return this.prisma.agendamentos.update({
            where: { id },
            data: { status: 'CANCELADO', canceledAt: new Date() },
            select: { id: true, status: true },
        });
    }
}
