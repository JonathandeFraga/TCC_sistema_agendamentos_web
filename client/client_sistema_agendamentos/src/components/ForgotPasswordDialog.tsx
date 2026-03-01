import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { api } from "../lib/api";
import { normalizeBrMobileToE164 } from "../utils/phone";
import axios from "axios";

type Tipo = "cliente" | "profissional";

export function ForgotPasswordDialog({
    tipo,
    onClose,
}: {
    tipo: Tipo;
    onClose: () => void;
}) {
    const [step, setStep] = useState<1 | 2>(1);
    const [foneInput, setFoneInput] = useState("");
    const [foneE164, setFoneE164] = useState<string>("");
    const [token, setToken] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [devToken, setDevToken] = useState<string | null>(null);

    async function requestToken() {
        const normalized = normalizeBrMobileToE164(foneInput);
        if (!normalized) {
            toast.error("Informe um celular válido (DDD + 9 dígitos).");
            return;
        }

        setIsLoading(true);
        setDevToken(null);
        try {
            const { data } = await api.post("/auth/forgot-password", {
                tipo,
                fone: normalized,
            });

            setFoneE164(normalized);
            if (data?.devToken) setDevToken(data.devToken);

            toast.success("Token enviado!");
            setStep(2);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const msg = (err.response?.data as any)?.message;
                toast.error(msg ?? "Erro ao solicitar token.");
            } else {
                toast.error("Erro inesperado.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function resetPassword() {
        if (!token || !novaSenha) {
            toast.error("Preencha token e nova senha.");
            return;
        }
        if (!foneE164) {
            toast.error("Telefone inválido. Volte e solicite o token novamente.");
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/auth/reset-password", {
                tipo,
                fone: foneE164,
                token,
                novaSenha,
            });

            toast.success("A senha foi redefinida.");
            onClose();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const msg = (err.response?.data as any)?.message;
                toast.error(msg ?? "Erro ao redefinir senha.");
            } else {
                toast.error("Erro inesperado");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-gray-900">Recuperar senha</h2>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        Fechar
                    </Button>
                </div>

                {step === 1 ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input
                                value={foneInput}
                                onChange={(e) => setFoneInput(e.target.value)}
                                placeholder="(51) 99999-9999"
                                disabled={isLoading}
                            />
                        </div>

                        <Button className="w-full" onClick={requestToken} disabled={isLoading}>
                            {isLoading ? "Enviando..." : "Enviar token"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {devToken && (
                            <div className="text-sm p-3 rounded bg-gray-50 border">
                                <b>DEV token:</b> {devToken}
                            </div>
                    )}

                    <div className="space-y-2">
                        <Label>Token</Label>
                        <Input
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Nova senha</Label>
                        <Input
                            type="password"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <Button className="w-full" onClick={resetPassword} disabled={isLoading}>
                        {isLoading ? "Salvando..." : "Redefinir senha"}
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setStep(1)}
                        disabled={isLoading}
                    >
                        Voltar
                    </Button>
                </div>
            )}
        </Card>
    </div>
  );
};