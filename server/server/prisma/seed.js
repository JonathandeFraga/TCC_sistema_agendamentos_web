// prisma/seed.js
require('dotenv/config');

const { PrismaClient, BookingStatus } = require('@prisma/client');
const argon2 = require('argon2');
const { DateTime } = require('luxon');

const prisma = new PrismaClient();
const TZ = 'America/Sao_Paulo';

function toDateOnly(isoDate) {
  return new Date(isoDate);
}

function moneyBRLToCent(value) {
  const s = value.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
  const n = Number(s);
  return Math.round(n * 100);
}

function isBlockedDate(d, holidaySet) {
  const iso = d.toISODate();
  return d.weekday === 1 || d.weekday === 7 || holidaySet.has(iso);
}

function nextValidDays(from, count, holidaySet) {
  const out = [];
  let cursor = from.startOf('day');
  while (out.length < count) {
    if (!isBlockedDate(cursor, holidaySet)) out.push(cursor);
    cursor = cursor.plus({ days: 1 });
  }
  return out;
}

function atLocal(d, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return d.set({ hour: h, minute: m, second: 0, millisecond: 0 });
}

function safeSlotForDuration(slot, durMin) {
  if (durMin >= 120) {
    if (slot === '10:30' || slot === '11:00') return '09:00';
    if (slot === '16:30' || slot === '17:00') return '14:00';
  }
  return slot;
}

async function main() {
  // 1. Feriados 2026
  const feriados2026 = [
    { data: '2026-01-01', nome: 'Confraternização Universal' },
    { data: '2026-04-03', nome: 'Sexta-feira Santa' },
    { data: '2026-04-21', nome: 'Tiradentes' },
    { data: '2026-05-01', nome: 'Dia do Trabalhador' },
    { data: '2026-09-07', nome: 'Independência do Brasil' },
    { data: '2026-09-20', nome: 'Revolução Farroupilha' },
    { data: '2026-10-12', nome: 'Nossa Senhora Aparecida' },
    { data: '2026-11-02', nome: 'Finados' },
    { data: '2026-11-15', nome: 'Proclamação da República' },
    { data: '2026-12-25', nome: 'Natal' },
  ];

  for (const f of feriados2026) {
    await prisma.feriados.upsert({
      where: { data: toDateOnly(f.data) },
      update: { nome: f.nome },
      create: { data: toDateOnly(f.data), nome: f.nome },
    });
  }

  const holidaySet = new Set(feriados2026.map((x) => x.data));

  // 2. Serviços
  const servicos = [
    { id: 1, nome: 'Esmaltação Tradicional - Manicure', duracaoMin: 60, custoCent: moneyBRLToCent('35,00'), descricao: 'Cutilagem, lixamento, esmaltação e top coat.' },
    { id: 2, nome: 'Esmaltação Tradicional - Pedicure', duracaoMin: 60, custoCent: moneyBRLToCent('50,00'), descricao: 'Inclui lixamento de calosidades e hidratação.' },
    { id: 3, nome: 'Decoração - Manicure (por unha)', duracaoMin: 60, custoCent: moneyBRLToCent('10,00'), descricao: 'Adesivos/pedrarias conforme escolha da cliente.' },
    { id: 4, nome: 'Decoração - Pedicure (por unha)', duracaoMin: 60, custoCent: moneyBRLToCent('10,00'), descricao: 'Adesivos/pedrarias conforme escolha da cliente.' },
    { id: 5, nome: 'Esmaltação em Gel - Manicure', duracaoMin: 60, custoCent: moneyBRLToCent('60,00'), descricao: 'Brilho intenso e maior durabilidade.' },
    { id: 6, nome: 'Esmaltação em Gel - Pedicure', duracaoMin: 60, custoCent: moneyBRLToCent('65,00'), descricao: 'Inclui lixamento de calosidades e hidratação.' },
    { id: 7, nome: 'Alongamento F1 (Manicure)', duracaoMin: 120, custoCent: moneyBRLToCent('110,00'), descricao: 'Moldes prontos sobre a unha natural.' },
    { id: 8, nome: 'Alongamento Gel Fibra de Vidro (Manicure)', duracaoMin: 120, custoCent: moneyBRLToCent('120,00'), descricao: 'Fios de fibra moldados sobre a unha.' },
  ];

  for (const s of servicos) {
    await prisma.servicos.upsert({
      where: { id: s.id },
      update: { nome: s.nome, custoCent: s.custoCent, duracaoMin: s.duracaoMin, descricao: s.descricao },
      create: { id: s.id, nome: s.nome, custoCent: s.custoCent, duracaoMin: s.duracaoMin, descricao: s.descricao },
    });
  }

  // 3. Usuários
  const senhaPadrao = '123456';
  const hash = await argon2.hash(senhaPadrao);

  // 3.1 Profissional
  const profFone = '+5551999990005';
  const profNome = 'Profissional Demo';

  const profissional = await prisma.loginProfissional.upsert({
    where: { fone: profFone },
    update: { nome: profNome, senha: hash },
    create: { fone: profFone, nome: profNome, senha: hash },
    select: { id: true, fone: true, nome: true },
  });

  // 3.2 Clientes
  const clientesSeed = [
    { fone: '+5551999999999', nome: 'Cliente AAA' },
    { fone: '+5551999999998', nome: 'Cliente BBB' },
    { fone: '+5551999999997', nome: 'Cliente CCC' },
    { fone: '+5551999999996', nome: 'Cliente DDD' },
    { fone: '+5551999999995', nome: 'Cliente EEE' },
    { fone: '+5551999999994', nome: 'Cliente FFF' },
  ];

  const clientes = [];
  for (const c of clientesSeed) {
    const cli = await prisma.loginCliente.upsert({
      where: { fone: c.fone },
      update: { nome: c.nome, senha: hash },
      create: { fone: c.fone, nome: c.nome, senha: hash },
      select: { id: true, fone: true, nome: true },
    });
    clientes.push(cli);
  }

  // 4. Agendamentos
  const now = DateTime.now().setZone(TZ);
  const futureDays = nextValidDays(now.plus({ days: 1 }), 10, holidaySet);
  const pastDays = nextValidDays(now.minus({ days: 14 }), 6, holidaySet);

  const slotsMorning = ['08:00', '09:15', '10:30'];
  const slotsAfternoon = ['14:00', '15:15', '16:30', '17:00'];

  const fromUtc = pastDays[0].startOf('day').toUTC().toJSDate();
  const toUtc = futureDays[futureDays.length - 1].plus({ days: 1 }).startOf('day').toUTC().toJSDate();

  await prisma.agendamentos.deleteMany({
    where: {
      profissionalId: profissional.id,
      inicio: { gte: fromUtc, lt: toUtc },
    },
  });

  for (let i = 0; i < futureDays.length; i++) {
    const d = futureDays[i];
    const cli = clientes[i % clientes.length];
    const serv = servicos[i % servicos.length];

    const rawSlot = i % 2 === 0 ? slotsMorning[i % slotsMorning.length] : slotsAfternoon[i % slotsAfternoon.length];
    const slot = safeSlotForDuration(rawSlot, serv.duracaoMin);

    const startLocal = atLocal(d, slot);
    const endLocal = startLocal.plus({ minutes: serv.duracaoMin });

    await prisma.agendamentos.create({
      data: {
        clienteId: cli.id,
        profissionalId: profissional.id,
        servicoId: serv.id,
        inicio: startLocal.toUTC().toJSDate(),
        fim: endLocal.toUTC().toJSDate(),
        status: BookingStatus.AGENDADO,
        custoCentSnap: serv.custoCent,
        duracaoMinSnap: serv.duracaoMin,
      },
    });
  }

  for (let i = 0; i < pastDays.length; i++) {
    const d = pastDays[i];
    const cli = clientes[(i + 2) % clientes.length];
    const serv = servicos[(i + 3) % servicos.length];

    const rawSlot = i % 2 === 0 ? '09:00' : '14:00';
    const slot = safeSlotForDuration(rawSlot, serv.duracaoMin);

    const startLocal = atLocal(d, slot);
    const endLocal = startLocal.plus({ minutes: serv.duracaoMin });

    const status = i % 3 === 0 ? BookingStatus.CANCELADO : BookingStatus.CONCLUIDO;

    await prisma.agendamentos.create({
      data: {
        clienteId: cli.id,
        profissionalId: profissional.id,
        servicoId: serv.id,
        inicio: startLocal.toUTC().toJSDate(),
        fim: endLocal.toUTC().toJSDate(),
        status,
        custoCentSnap: serv.custoCent,
        duracaoMinSnap: serv.duracaoMin,
        canceledAt: status === BookingStatus.CANCELADO ? now.toUTC().toJSDate() : null,
        concludedAt: status === BookingStatus.CONCLUIDO ? endLocal.toUTC().toJSDate() : null,
      },
    });
  }

  console.log('Seed concluído ✅');
  console.log('Credenciais para avaliação: ');
  console.log(`PROFISSIONAL: fone=${profFone} senha=${senhaPadrao}`);
  console.log(`CLIENTE (ex): fone=${clientesSeed[0].fone} senha=${senhaPadrao}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });