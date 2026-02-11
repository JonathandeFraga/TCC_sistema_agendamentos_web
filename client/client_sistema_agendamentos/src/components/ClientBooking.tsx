import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Calendar, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { api } from "../lib/api";
import { formatBRLFromCent, isoToBRDate } from "../utils/format";

interface ClientBookingProps {
    onBack: () => void;
}

type Service = {
    id: number;
    nome: string;
    custoCent: number;
    duracaoMin: string;
    descricao: string;
};

type AvailableDay = { date: string; available: boolean };

type MyBooking = {
    id: number;
    status: "AGENDADO" | "CONCLUIDO" | "CANCELADO";
    inicio: string;
    fim: string;
    servico: { id: number; nome: string; duracaoMin: number; custoCent: number };
};

function yyyyMmNow(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function isoDateFromISOString(iso: string) {
    return iso.slice(0, 10);
}

function hhmmFromISOString(iso: string) {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

export function ClientBooking({ onBack }: ClientBookingProps) {
    const [view, setView] = useState<'services' | 'schedule' | 'mybookings'>('services');

    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);

    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

    const [month, setMonth] = useState<string>(yyyyMmNow());
    const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [myBookings, setMyBookings] = useState<MyBooking[]>([]);
    const [loadingMyBookings, setLoadingMyBookings] = useState(false);

    const selectedService = useMemo(
        () => services.find((s) => s.id === selectedServiceId) ?? null,
        [services, selectedServiceId]
    );

    useEffect(() => {
        (async () => {
            try {
                setLoadingServices(true);
                const res = await api.get<Service[]>("/servicos");
                setServices(res.data);
            } catch (e) {
                toast.error("Falha ao carregar serviços.");
            } finally {
                setLoadingServices(false);
            }
        })();
    }, []);

    const loadMyBookings = async () => {
        try {
            setLoadingMyBookings(true);
            const res = await api.get<MyBooking[]>("/agendamentos/me");
            setMyBookings(res.data);
        } catch (e) {
            toast.error("falha ao carregar seus agendamentos.");
        } finally {
            setLoadingMyBookings(false);
        }
    };

    useEffect(() =>{
        if (!selectedServiceId) return;

        (async () => {
            try {
                setAvailableDays([]);
                setSelectedDate(null);
                setAvailableTimes([]);
                setSelectedTime(null);

                const res = await api.get<AvailableDay[]>("/agendamentos/disponibilidade/dias", {
                    params: { servicoId: selectedServiceId, mes: month },
                });
                setAvailableDays(res.data);
            } catch (e) {
                toast.error("Falha ao carregar dias disponíveis.");
            }
        })();
    }, [selectedServiceId, month]);

    useEffect(() => {
        (async () => {
            try {
                setAvailableTimes([]);
                setSelectedTime(null);

                const rest = await api.get<string[]>("/agendamentos/disponibilidade/horarios", {
                    params: { servicoid: selectedServiceId, data: selectedDate },
                });

                setAvailableTimes(rest.data);
            } catch (e) {
                toast.error("Falha ao carregar horários disponíveis.");
            }
        })()
    }, [selectedServiceId, selectedDate]);

    const handleConfirmBooking = async () => {
        if (!selectedServiceId || !selectedDate || !selectedTime) return;

        try {
            await api.post("/agendamentos", {
                servicoId: selectedServiceId,
                data: selectedDate,
                hora: selectedTime,
            });

            toast.success("Agendamento confirmado", {
                description: `${selectedService?.nome ?? "Serviço"} em ${isoToBRDate(selectedDate)} às ${selectedTime}`,
            });

            setSelectedServiceId(null);
            setSelectedDate(null);
            setSelectedTime(null);
            setAvailableDays([]);
            setAvailableTimes([]);
            setView("services");
        } catch (e: any) {
            const msg = e?.response?.data?.message;
            toast.error(typeof msg === "string" ? msg: "Falha ao criar agendamento.");
        }
    };

    const handleCancel = async (id: number) => {
        try {
            await api.post(`/agendamentos/${id}/cancelar`);
            toast.success("Agendamento cancelado.");
            await loadMyBookings();
        } catch (e: any) {
            const msg = e?.response?.data?.message;
            toast.error(typeof msg === "string" ? msg : "Não foi possível cancelar.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3x1 mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-gray-900">Agendamento</h1>
                            <p className="text-gray-600">
                                {view === "services" ? "Escolha seu serviço" : view === "schedule" ? "Selecione data e horário" : "Seus agendamentos"}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={view === "services" ? "default" : "outline"}
                            onClick={() => setView("services")}
                            className="flex-1"
                        >
                            Serviços
                        </Button>
                        <Button
                            variant={view === "mybookings" ? "default" : "outline"}
                            onClick={() => {
                                setView("mybookings");
                                loadMyBookings();
                            }}
                            className="flex-1"
                        >
                            Meus Agendamentos
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-3x1 mx-auto p-4 pb-24">
                {view === "services" && (
                    <div className="space-y-4">
                        <h2 className="text-gray-900">Escolha o Serviço</h2>
                        
                        {loadingServices && <p className="text-gray-600">Carregando serviços...</p>}
                        {!loadingServices && services.length === 0 && <p className="text-gray-600">Nenhum serviço cadastrado.</p>}

                        {services.map((service) => (
                            <Card
                                key={service.id}
                                className="p-4 cursor-pointer transition-all hover:shadow-md"
                                onClick={() => {
                                    setSelectedServiceId(service.id);
                                    setView("schedule");
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-gray-900">{service.nome}</h3>
                                        <p className="text-gray-600 mb-2">{service.descricao}</p>

                                        <div className="flex items-center gap-4 text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{service.duracaoMin}</span>
                                            </div>
                                            <span className="text-pink-600">{formatBRLFromCent(service.custoCent)}</span>
                                        </div>
                                    </div>
                                    {selectedServiceId === service.id && <CheckCircle2 className="w-6 h-6 text-pink-600" />}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {view === "schedule" && selectedService && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-gray-900">Agendar</h2>
                                <Button 
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedServiceId(null);
                                        setSelectedDate(null);
                                        setSelectedTime(null);
                                        setAvailableDays([]);
                                        setAvailableTimes([]);
                                        setView("services");
                                    }}
                                >
                                    Trocar Serviço
                                </Button>
                            </div>

                            <Card className="p-4 bg-pink-50 border-pink-200">
                                <p className="text-gray-900">{selectedService.nome}</p>
                                <p className="text-gray-600">
                                    {selectedService.duracaoMin} min • {formatBRLFromCent(selectedService.custoCent)}
                                </p> 
                            </Card>
                        </div>

                        <div>
                            <Label className="block mb-3">Escolha o Mês</Label>
                            <input 
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block mb-3">Escolha a Data</label>
                            <div className="grid grid-cols-3 gap-2">
                                {availableDays
                                    .filter((d) => d.available)
                                    .map((d) => (
                                        <Button
                                            key={d.date}
                                            variant={selectedDate === d.date ? "default" : "outline"}
                                            onClick={() => setSelectedDate(d.date)}
                                            className="h-auto py-3"
                                        >
                                            <div className="text-center">
                                                <div>{d.date.split("-")[2]}</div>
                                                <div className="text-xs">{d.date.split("-")[1]}/{d.date.split("-")[0].slice(-2)}</div>
                                            </div>
                                        </Button>
                                    ))
                                }

                                {selectedServiceId && availableDays.length > 0 && availableDays.filter((d) => d.available).length === 0 && (
                                    <p className="text-gray-600 col-span-3">Nenhum dia disponível neste mês.</p>
                                )}
                            </div>
                        </div>

                        {selectedDate && (
                            <div>
                                <Label className="block mb-3">Escolha o Horário</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {availableTimes.map((time) => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? "default" : "outline"}
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                </div>

                                {availableTimes.length === 0 && (
                                    <p className="text-gray-600 mt-2">Nenhum horário disponível para este dia.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {view === 'mybookings' && (
                    <div className="space-y-4">
                        <h2 className="text-gray-900">Meus Agendamentos</h2>

                        {loadingMyBookings && <p className="text-gray-600">Carregando...</p>}
                        {!loadingMyBookings && myBookings.length === 0 && <p className="text-gray-600">Você não tem agendamentos.</p>}

                        {myBookings.map((b) => {
                            const date = isoDateFromISOString(b.inicio);
                            const time = hhmmFromISOString(b.inicio);

                            return (
                                <Card key={b.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-white" /> 
                                            </div>

                                            <div>
                                                <h3 className="text-gray-900">{b.servico.nome}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{isoToBRDate(date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-3" />
                                                        <span>{time}</span>
                                                    </div>
                                                    <span className="text-xs px-2 py-0.5 rounded border">
                                                        {b.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600"
                                            disabled={b.status !== "AGENDADO"}
                                            onClick={() => handleCancel(b.id)}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            {view === "schedule" && selectedService && selectedDate && selectedTime && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                    <div className="max-w-3x1 mx-auto">
                        <Button
                            onClick={handleConfirmBooking}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        >
                            Confirmar Agendamento
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};