import { useState } from "react";
import { ArrowLeft, Calendar, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface ClientBookingProps {
    onBack: () => void;
}

const services = [
    { id: 1, name: 'Manicure Clássica', duration: '45 min', price: 'R$ 40', description: 'Cuidado completo com as unhas das mãos' },
    { id: 2, name: 'Pedicure Clássica', duration: '60 min', price: 'R$ 50', description: 'Cuidado completo com os pés' },
    { id: 3, name: 'Esmaltação em Gel', duration: '90 min', price: 'R$ 80', description: 'Esmaltação duradoura com acabamento profissional' },
    { id: 4, name: 'Spa dos Pés', duration: '75 min', price: 'R$ 70', description: 'Tratamento relaxante com hidratação profunda' },
    { id: 5, name: 'Manicure + Pedicure', duration: '120 min', price: 'R$ 85', description: 'Pacote completo de cuidados' },
];

const availableDates = [
    '26/12/2025',
    '27/12/2025',
    '28/12/2025',
    '29/12/2025',
    '30/12/2025',   
];

const availableTimes = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const myBooking = [
    { id: 1, service: 'Manicure Clássica', date: '27/12/2025', time: '14:00' },
    { id: 2, service: 'Pedicure Clássica', date: '29/12/2025', time: '10:00' },
];

export function ClientBooking({ onBack }: ClientBookingProps) {
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [view, setView] = useState<'services' | 'schedule' | 'mybookings'>('services');

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