import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, DollarSign, TrendingUp, Users, Check, X, Car } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { api } from "../lib/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ProfessionalDashboardProps {
    onBack: () => void;
}

type Kpis = {
  todayAppointments: number;
  weekUniqueClients: number;
  monthRevenueCent: number;
};

type AppointmentDay = {
  day: string;
  agendamentos: number;
};

type PopularService = {
  name: string;
  value: number;
  percent: number;
};

type RevenuePoint = {
  month: string;
  receita: number;
};

type BookItem = {
  id: number;
  status: "AGENDADO" | "CONCLUIDO" | "CANCELADO";
  inicio: string;
  fim: string;
  cliente: { id: number; nome: string; fone: string };
  servico: { id: number; nome: string; duracaoMin: number; custoCent: number };
};

function brlFromCent(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function hhmm(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function brDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

export function ProfessionalDashboard({ onBack }: ProfessionalDashboardProps) {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [appointmentsByDay, setAppointmentsByDay] = useState<AppointmentDay[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [agenda, setAgenda] = useState<BookItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm =String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [to, setTo] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const colors = useMemo(
    () => ["#ec4899", "#a855f7", "#f97316", "#8b5cf6", "#22c55e", "#06b6d4", "#eab308", "#ef4444"],
    []
  );

  const loadAll = async () => {
    try {
      setLoading(true);

      const year = new Date().getFullYear();

      const [k, a, s, r, ag] = await Promise.all([
        api.get<Kpis>("/profissional/kpis"),
        api.get<AppointmentDay[]>("/profissional/metricas/agendamentos-por-dia"),
        api.get<PopularService[]>("/profissional/metricas/servicos-populares", { params: { from, to } },),
        api.get<RevenuePoint[]>("/profissional/metricas/receita-mensal", { params: { year } }),
        api.get<BookItem[]>("/profissional/agenda", { params: { from, to } }),
      ]);

      setKpis(k.data);
      setAppointmentsByDay(a.data);
      setPopularServices(s.data);
      setRevenue(r.data);
      setAgenda(ag.data);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Falha ao carregar dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [from, to]);

  const handleConcluir = async (id: number) => {
    try {
      await api.post(`/profissional/agendamentos/${id}/concluir`);
      toast.success("Agendamento concluído.");
      await loadAll();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Falha ao concluir agendamento.");
    }
  };

  const handleCancelar = async (id: number) => {
    try {
      await api.post(`/profissional/agendamentos/${id}/cancelar`);
      toast.success("Agendamento cancelado.");
      await loadAll();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Falha ao cancelar agendamento.");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-gray-900">Dashboard Profissional</h1>
            <p className="text-gray-600">Agenda e métricas do negócio</p>
          </div>

          <Button variant="outline" onClick={loadAll} disabled={loading}>
            Atualizar
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
            <div className="flex-1">
              <label className="text-sm text-gray-600">De</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">Até</label>
              <input 
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white"
              />
            </div>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-gray-600">Hoje</p>
                <p className="text-gray-900">
                  {loading ? "..." : `${kpis?.todayAppointments ?? 0} agendamentos`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Esta semana</p>
                <p className="text-gray-900">
                  {loading ? "..." : `${kpis?.weekUniqueClients ?? 0} clientes`}
                </p>
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
                <p className="text-gray-900">
                  {loading ? "..." : brlFromCent(kpis?.monthRevenueCent ?? 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-gray-900 mb-4">Agendamentos por Dia</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appointmentsByDay}>
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
                  data={popularServices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {popularServices.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

////////////////////////////////////////////////////
        {/* Agenda */}

      </main>
    </div>
  );
}