import { ArrowLeft, Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProfessionalDashboardProps {
    onBack: () => void;
}

const appointmentsData = [
    { day: 'Seg', agendamentos: 12 },
    { day: 'Ter', agendamentos: 15 },
    { day: 'Qua', agendamentos: 18 },
    { day: 'Qui', agendamentos: 14 },
    { day: 'Sex', agendamentos: 22 },
    { day: 'Sáb', agendamentos: 28 },
    { day: 'Dom', agendamentos: 8 },
];

const servicesData = [
    { name: 'Manicure', value: 45, color: '#ec4899' },
    { name: 'Pedicure', value: 35, color: '#a855f7' },
    { name: 'Esmaltação em Gel', value: 28, color: '#f97316' },
    { name: 'Spa dos Pés', value: 22, color: '#8b5cf6' },
];

const revenueData = [
  { month: 'Jan', receita: 4200 },
  { month: 'Fev', receita: 5100 },
  { month: 'Mar', receita: 4800 },
  { month: 'Abr', receita: 6200 },
  { month: 'Mai', receita: 5900 },
  { month: 'Jun', receita: 7200 },
];

const upcomingAppointments = [
  { id: 1, client: 'Maria Silva', service: 'Manicure', time: '14:00', date: '26/12/2025' },
  { id: 2, client: 'Ana Costa', service: 'Pedicure', time: '15:30', date: '26/12/2025' },
  { id: 3, client: 'Julia Santos', service: 'Esmaltação em Gel', time: '16:00', date: '26/12/2025' },
  { id: 4, client: 'Beatriz Oliveira', service: 'Spa dos Pés', time: '10:00', date: '27/12/2025' },
];

export function ProfessionalDashboard({ onBack }: ProfessionalDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-gray-900">Dashboard Profissional</h1>
            <p className="text-gray-600">Visão geral do negócio</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-gray-600">Hoje</p>
                <p className="text-gray-900">8 agendamentos</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Esta Semana</p>
                <p className="text-gray-900">117 clientes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600">Mês Atual</p>
                <p className="text-gray-900">R$ 7.200</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Crescimento</p>
                <p className="text-gray-900">+22%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-gray-900 mb-4">Agendamentos por Dia</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appointmentsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="agendamentos" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-gray-900 mb-4">Serviços Mais Populares</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={servicesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {servicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-gray-900 mb-4">Receita Mensal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="receita" stroke="#a855f7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Próximos Agendamentos */}
        <Card className="p-6">
          <h2 className="text-gray-900 mb-4">Próximos Agendamentos</h2>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                    {appointment.client.charAt(0)}
                  </div>
                  <div>
                    <p className="text-gray-900">{appointment.client}</p>
                    <p className="text-gray-600">{appointment.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">{appointment.time}</p>
                  <p className="text-gray-600">{appointment.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}