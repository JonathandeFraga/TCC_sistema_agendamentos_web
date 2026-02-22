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

    const rows = await this.prisma.$queryRaw<
        Array<{
        id: number;
        status: 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';
        inicio: Date;
        fim: Date;
        clienteId: number;
        clienteNome: string;
        clienteFone: string;
        servicoId: number;
        servicoNome: string;
        servicoDuracaoMin: number;
        servicoCustoCent: number;
        }>
    >`
        SELECT
        a."id",
        a."status",
        a."inicio",
        a."fim",
        c."id"   AS "clienteId",
        c."nome" AS "clienteNome",
        c."fone" AS "clienteFone",
        s."id"   AS "servicoId",
        s."nome" AS "servicoNome",
        s."duracaoMin" AS "servicoDuracaoMin",
        s."custoCent"  AS "servicoCustoCent"
        FROM "agendamentos" a
        JOIN "loginCliente" c ON c."id" = a."clienteId"
        JOIN "servicos" s     ON s."id" = a."servicoId"
        WHERE a."inicio" >= ${startUtc}
        AND a."inicio" <= ${endUtc}
        ORDER BY
        CASE a."status"
            WHEN 'AGENDADO' THEN 1
            WHEN 'CONCLUIDO' THEN 2
            WHEN 'CANCELADO' THEN 3
            ELSE 99
        END ASC,
        a."inicio" ASC
    `;

    return rows.map((r) => ({
        id: r.id,
        status: r.status,
        inicio: r.inicio,
        fim: r.fim,
        cliente: { id: r.clienteId, nome: r.clienteNome, fone: r.clienteFone },
        servico: { id: r.servicoId, nome: r.servicoNome, duracaoMin: r.servicoDuracaoMin, custoCent: r.servicoCustoCent },
    }));
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
        const today = DateTime.now().setZone(TZ).startOf('day');
        const endLocal = today.plus({ days: 6 }).endOf('day');

        const startUtc = today.toUTC().toJSDate();
        const endUtc = endLocal.toUTC().toJSDate();

        const rows = await this.prisma.$queryRaw<
            Array<{ d: string; count: number }>
        >`
            WITH tz AS (SELECT ${TZ}::text AS tz),
            days AS (
                SELECT gs::date AS d
                FROM generate_series(
                    ${today.toISODate()}::date,
                    ${endLocal.toISODate()}::date,
                    interval '1 day'
                ) gs
                WHERE extract(isodow from gs)::int NOT IN (1, 7)
                    AND NOT EXISTS (
                        SELECT 1 FROM "feriados" f
                        WHERE f."data" = gs::date
                    ) 
            ),
            agg AS (
                SELECT
                    (a."inicio" AT TIME ZONE (SELECT tz FROM tz))::date AS d,
                    count(*)::int AS "count"
                FROM "agendamentos" a
                WHERE a."inicio" >= ${startUtc}
                    AND a."inicio" <= ${endUtc}
                    AND a."status" IN ('AGENDADO')
                GROUP BY (a."inicio" AT TIME ZONE (SELECT tz FROM tz))::date
            )
            SELECT
                to_char(days.d, 'YYYY-MM-DD') AS d,
                COALESCE(agg."count", 0)::int AS "count"
            FROM days
            LEFT JOIN agg USING (d)
            ORDER BY days.d ASC
        `;

        return rows.map((r) => {
            const dt = DateTime.fromISO(r.d, { zone: TZ });
            return {
                label: dt.toFormat('dd-MM'),
                day: dt.toFormat('ccc'),
                agendamentos: r.count,
                date: r.d,
            };
        });
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
            percent: ((g._count.servicoId ?? 0) / total),
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
        const map = new Map<number, number>(rows.map((r) => [r.month, r.revenueCent]));

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
