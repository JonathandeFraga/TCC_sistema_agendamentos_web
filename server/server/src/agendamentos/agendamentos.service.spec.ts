import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AgendamentosService } from './agendamentos.service';
import { PrismaService } from 'src/database/prisma.service';

describe('AgendamentosService', () => {
  let svc: AgendamentosService;

  const prismaMock = {
    servicos: {
      findUnique: jest.fn(),
    },
    agendamentos: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.useFakeTimers();

    jest.setSystemTime(new Date('2026-02-14T12:00:00-03:00'));

    const mod = await Test.createTestingModule({
      providers: [
        AgendamentosService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    svc = mod.get(AgendamentosService);

    prismaMock.servicos.findUnique.mockReset();
    prismaMock.agendamentos.findMany.mockReset();
    prismaMock.agendamentos.findFirst.mockReset();
    prismaMock.agendamentos.create.mockReset();
    prismaMock.agendamentos.update.mockReset();
    prismaMock.agendamentos.findUnique.mockReset();
    prismaMock.$queryRaw.mockReset();
    prismaMock.$transaction.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function mockNotHoliday() {
    prismaMock.$queryRaw.mockResolvedValue([{ exists: false }]);
  }

  function mockHoliday() {
    prismaMock.$queryRaw.mockResolvedValue([{ exists: true }]);
  }

  it('Criar agendamento válido (dia útil, dentro do horário) -> cria', async () => {
    prismaMock.servicos.findUnique.mockResolvedValue({
      id: 1,
      duracaoMin: 60,
      custoCent: 3500,
    });
    mockNotHoliday();

    prismaMock.$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        agendamentos: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id:999, status: 'AGENDADO' }),
        },
      };
      return fn(tx);
    });

    const res = await svc.criarAgendamento(10, { servicoId: 1, data: '2026-02-18', hora: '10:00' });
    expect(res).toMatchObject({ id: 999, status: 'AGENDADO' });
  });

  it('Impedir agendamento paralelo -> ConflictException', async () => {
    prismaMock.servicos.findUnique.mockResolvedValue({
      id: 1,
      duracaoMin: 60,
      custoCent: 3500,
    });
    mockNotHoliday();

    prismaMock.$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        agendamentos: {
          findFirst: jest.fn().mockResolvedValue({ id:123 }),
          create: jest.fn(),
        },
      };
      return fn(tx);
    });
    await expect(
      svc.criarAgendamento(10, { servicoId: 1, data: '2026-02-18', hora: '10:00' })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('Bloquear domingo -> BadRequestException', async () => {
    prismaMock.servicos.findUnique.mockResolvedValue({
      id: 1,
      duracaoMin: 60,
      custoCent: 3500,
    });
    mockNotHoliday();

    await expect(
      svc.criarAgendamento(10, { servicoId: 1, data: '2026-02-15', hora: '10:00' })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('Bloquear segunda-feira -> BadRequestException', async () => {
    prismaMock.servicos.findUnique.mockResolvedValue({
      id: 1,
      duracaoMin: 60,
      custoCent: 3500,
    });
    mockNotHoliday();

    await expect(
      svc.criarAgendamento(10, { servicoId: 1, data: '2026-02-16', hora: '10:00' })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('Bloquear feriado -> BadRequestException', async () => {
    prismaMock.servicos.findUnique.mockResolvedValue({
      id: 1,
      duracaoMin: 60,
      custoCent: 3500,
    });
    mockHoliday();

    await expect(
      svc.criarAgendamento(10, { servicoId: 1, data: '2026-02-18', hora: '10:00' })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('Bloquear fora do horário (antes de 08:00) -> BadRequestException', async () => {
    prismaMock.servicos.findUnique.mockResolvedValue({
      id: 1,
      duracaoMin: 60,
      custoCent: 3500,
    });
    mockNotHoliday();

    await expect(
      svc.criarAgendamento(10, { servicoId: 1, data: '2026-02-18', hora: '07:45' })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('Cancelamento permitido (>1h) -> atualiza status', async () => {
    prismaMock.agendamentos.findFirst.mockResolvedValue({
      id: 1,
      status: 'AGENDADO',
      inicio: new Date('2026-02-14T18:00:00Z'),
    });
    prismaMock.agendamentos.update.mockResolvedValue({ id: 1, status: 'CANCELADO' });

    const res = await svc.cancelar(10, 1);
    expect(res).toMatchObject({ id: 1, status: 'CANCELADO' });
  });

  it('Bloquear cancelamento fora do prazo (<1h) -> ForbiddenException', async () => {
    prismaMock.agendamentos.findFirst.mockResolvedValue({
      id: 1,
      status: 'AGENDADO',
      inicio: new Date('2026-02-14T15:30:00Z'),
    });

    await expect(svc.cancelar(10, 1)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('Serviço inexistente -> NotFoundException', async () => {
    prismaMock.servicos.findUnique.mockResolvedValue(null);
    await expect(
      svc.criarAgendamento(10, { servicoId: 999, data: '2026-02-18', hora: '10:00' })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

});
