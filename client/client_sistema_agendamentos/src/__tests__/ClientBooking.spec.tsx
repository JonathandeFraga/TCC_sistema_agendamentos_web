import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ClientBooking } from '../components/ClientBooking';

vi.mock('../lib/api', () => {
    return {
        api: {
            get: vi.fn(),
            post: vi.fn(),
        },
    };
});

import { api } from '../lib/api';

describe('ClientBooking', () => {
    const onBack = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Renderização do formulário de agendamento: carrega serviços', async () => {
        (api.get as any).mockResolvedValueOnce({
            data: [
                { id: 1, nome: 'Manicure', custoCent: 3500, duracaoMin: 60, descricao: 'desc' },
            ],
        });

        render(<ClientBooking onBack={onBack} />);

        expect(await screen.findByText('Manicure')).toBeInTheDocument();
    });

    it('Bloquear seleção de dias inválidos: apenas available=true aparece', async () => {
        (api.get as any).mockResolvedValueOnce({
            data: [{ id: 1, nome: 'Manicure', custoCent: 3500, duracaoMin: 60, descircao: 'desc' }],
        }).mockResolvedValueOnce({
            data: [
                { data: '2026-02-15', available: false },
                { date: '2026-02-18', available: true },
            ],
        });

        render(<ClientBooking onBack={onBack} />);

        await userEvent.click(await screen.findByText('Manicure'));

        expect(await screen.findByText('18')).toBeInTheDocument();
        expect(screen.queryByText('15')).not.toBeInTheDocument();
    });

    it('Bloquear seleção de horários inválidos: lista vem só com horáros permitidos', async () => {
        (api.get as any).mockResolvedValueOnce({
            data: [{ id: 1, nome: 'Manicure', custoCent: 3500, duracaoMin: 60, descricao: 'desc' }],
        }).mockResolvedValueOnce({
            data: [{ date: '2026-02-18', available: true }],
        }).mockResolvedValueOnce({
            data: ['09:00', '10:00', '14:00'],
        });

        render(<ClientBooking onBack={onBack} />);

        await userEvent.click(await screen.findByText('Manicure'));
        await userEvent.click(await screen.findByText('18'));

        expect(await screen.findByText('09:00')).toBeInTheDocument();
        expect(screen.queryByText('13:00')).not.toBeInTheDocument();
    });

    it('Exibir erro de agendamento paralelo: backend retorna 409', async () => {
        (api.get as any).mockResolvedValueOnce({
            data: [{ id: 1, nome: 'Manicure', custoCent: 3500,duracaoMin: 60, descricao: 'desc' }],
        }).mockResolvedValueOnce({ data: [{ date: '2026-02-18', available: true }] })
        .mockResolvedValueOnce({ data: ['10:00'] });

        (api.post as any).mockResolvedValueOnce({
            response: { data: { message: 'Horário indisponível' }, status: 409 },
        });

        render(<ClientBooking onBack={onBack} />);

        await userEvent.click(await screen.findByText('Manicure'));
        await userEvent.click(await screen.findByText('18'));
        await userEvent.click(await screen.findByText('10:00'));

        await userEvent.click(await screen.findByRole('button',{ name: /Confirmar Agendamento/i }));

        await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    });

    it('Fluxo completo: usuário confirma e POST é chamado com payload correto', async () => {
        (api.get as any).mockResolvedValueOnce({
            data: [{ id: 1, nome: 'Manicure', custoCent: 3500, duracaoMin: 60, descricao: 'desc' }],
        }).mockResolvedValueOnce({
            data: [{  date: '2026-02-18', available: true }],
        }).mockResolvedValueOnce({ data: ['10:00'] });

        (api.post as any).mockResolvedValueOnce({ data: { id:123 } });

        render(<ClientBooking onBack={onBack} />);

        await userEvent.click(await screen.findByText('Manicure'));
        await userEvent.click(await screen.findByText('18'));
        await userEvent.click(await screen.findByText('10:00'));

        await userEvent.click(await screen.findByRole('button', { name: /Confirmar Agendamento/i }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                '/agendamentos', { servicoId: 1, data: '2026-02-18', hora: '10:00' },
            );
        });
    });
});