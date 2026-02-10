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

    };




    
    const handleBooking = () => {
        if (selectedService && selectedDate && selectedTime) {
            const service = services.find(s => s.id === selectedService);
            toast.success('Agendamento confirmado.', {
                description: `${service?.name} em ${selectedDate} às ${selectedTime}.`,
            });
            setSelectedService(null);
            setSelectedDate(null);
            setSelectedTime(null);
            setView('services');
        };
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
                            <p className="text-gray-600">Escolha seu serviço</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={view === 'services' ? 'default' : 'outline'}
                            onClick={() => setView('services')}
                            className="flex-1"
                        >
                            Serviços
                        </Button>
                        <Button
                            variant={view === 'mybookings' ? 'default' : 'outline'}
                            onClick={() => setView('mybookings')}
                            className="flex-1"
                        >
                            Meus Agendamentos
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-3x1 mx-auto p-4 pb-24">
                {view === 'services' && (
                    <div className="space-y-4">
                        <h2 className="text-gray-900">Escolha o Serviço</h2>
                        {services.map((service) => (
                            <Card
                                key={service.id}
                                className={`p-4 cursor-pointer transition-all ${
                                    selectedService === service.id
                                        ? 'border-2 border-pink-500 bg-pink-50'
                                        : 'hover:shadow-md'
                                }`}
                                onClick={() => {
                                    setSelectedService(service.id);
                                    setView('schedule');
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-gray-900">{service.name}</h3>
                                        <p className="text-gray-600 mb-2">{service.description}</p>
                                        <div className="flex items-center gap-4 text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{service.duration}</span>
                                            </div>
                                            <span className="text-pink-600">{service.price}</span>
                                        </div>
                                    </div>
                                    {selectedService === service.id && (
                                        <CheckCircle2 className="w-6 h-6 text-pink-600" />
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {view === 'schedule' && selectedService && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-gray-900">Agendar</h2>
                                <Button variant="ghost" size="sm" onClick={() => setView('services')}>
                                    Trocar Serviço
                                </Button>
                            </div>
                            <Card className="p-4 bg-pink-50 border-pink-200">
                                <p className="text-gray-900">{services.find(s => s.id === selectedService)?.name}</p>
                                <p className="text-gray-600">{services.find(s => s.id === selectedService)?.duration} • {services.find(s => s.id === selectedService)?.price}</p> 
                            </Card>
                        </div>

                        <div>
                            <Label className="block mb-3">Escolha a Data</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {availableDates.map((date) => (
                                    <Button
                                        key={date}
                                        variant={selectedDate === date ? 'default' : 'outline'}
                                        onClick={() => setSelectedDate(date)}
                                        className="h-auto py-3"
                                    >
                                        <div className="text-center">
                                            <div>{date.split('/')[0]}</div>
                                            <div className="text-xs">{date.split('/')[1]}/{date.split('/')[2].slice(-2)}</div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {selectedDate && (
                            <div>
                                <Label className="block mb-3">Escolha o Horário</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {availableTimes.map((time) => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? 'default' : 'outline'}
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === 'mybookings' && (
                    <div className="space-y-4">
                        <h2 className="text-gray-900">Meus Agendamentos</h2>
                        {myBooking.map((booking) => (
                            <Card key={booking.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-white" /> 
                                        </div>
                                        <div>
                                            <h3 className="text-gray-900">{booking.service}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="2-4 h-4" />
                                                    <span>{booking.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-3" />
                                                    <span>{booking.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-600">
                                        Cancelar
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {view === 'schedule' && selectedService && selectedDate && selectedTime && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                    <div className="max-w-3x1 mx-auto">
                        <Button onClick={handleBooking} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                            Confirmar Agendamento
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};