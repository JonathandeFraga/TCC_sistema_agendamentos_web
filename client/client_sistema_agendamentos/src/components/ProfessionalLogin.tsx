import { useState } from "react";
import { ArrowLeft, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { api } from "../lib/api";
import axios from "axios";
import { normalizeBrMobileToE164 } from "../utils/phone";

interface ProfessionalLoginProps {
  onBack: () => void;
  onLogin: () => void;
}

type LoginResponse = { accessToken: string; nome: string};

export function ProfessionalLogin({ onBack, onLogin }: ProfessionalLoginProps) {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!phone || !password) {
          toast.error("Favor preencher todos os campos.");
          return;
        }

        const foneE164 = normalizeBrMobileToE164(phone);
        if (!foneE164) {
          toast.error("Informe um celular válido (DDD + 9 dígitos).");
          return;
        }

        setIsLoading(true);

        try {
          const response = await api.post<LoginResponse>('/auth/login', {
            fone: foneE164,
            senha: password,
            tipo: "profissional"
          });

          sessionStorage.setItem("access_token", response.data.accessToken);
          toast.success(`Bem vindo, ${response.data.nome}.`);
          onLogin();

        } catch(err) {
          if (axios.isAxiosError(err)) {
            const msg = (err.response?.data as any)?.message;
            toast.error(msg ?? "Falha no login. Verifique telefone e senha.");
          } else {
            toast.error("Erro inesperado.");
          }
        } finally {
          setIsLoading(false)
        }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Card className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-gray-900">Acesso Profissional</h1>
              <p className="text-gray-600">Entre com suas credenciais</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(51) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center">
              <button className="text-purple-600 hover:underline">
                Esqueceu sua senha?
              </button>
            </div>
          </Card>
        </div>
      </div> 
    );
}