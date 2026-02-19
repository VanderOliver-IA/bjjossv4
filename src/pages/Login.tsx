import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNotFound(false);

        try {
            // 1. Tentar verificar o perfil, mas não bloquear o login se falhar (pode ser RLS restringindo anon)
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            // 2. Login real
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Se o login falhou E o perfil não foi encontrado na etapa 1, 
                // então podemos dizer com mais confiança que não existe.
                if (!profile) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                toast({
                    variant: "destructive",
                    title: "Erro no acesso",
                    description: "Senha incorreta ou erro de rede.",
                });
                return;
            }

            if (data.user) {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Erro inesperado",
                description: "Tente novamente mais tarde.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse" />
                        <h1 className="text-4xl font-black tracking-tighter relative z-10">
                            Bjj<span className="text-blue-500">Oss</span>
                        </h1>
                    </div>
                </div>

                {/* Form Wrapper */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">

                    {/* Overlay para Cadastro se o usuário não for encontrado */}
                    {notFound && (
                        <div className="absolute inset-0 bg-blue-600/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
                            <h3 className="text-2xl font-bold mb-3">CONTA NÃO ENCONTRADA</h3>
                            <p className="text-blue-100 mb-8 leading-relaxed">
                                Este email não está cadastrado em nosso sistema. Deseja criar sua conta trial de 7 dias agora?
                            </p>
                            <div className="flex flex-col w-full gap-4">
                                <Button
                                    onClick={() => navigate(`/cadastro?email=${email}`)}
                                    className="bg-white text-blue-600 hover:bg-slate-100 font-black h-14 rounded-2xl text-lg"
                                >
                                    SIM, CRIAR MEU ACESSO
                                </Button>
                                <Button
                                    onClick={() => setNotFound(false)}
                                    variant="ghost"
                                    className="text-white hover:bg-white/10 h-12 underline"
                                >
                                    Tentar outro email
                                </Button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-400">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="mestre@jiujitsu.com"
                                className="bg-[#1e293b] border-slate-700 h-12 rounded-xl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" disabled={notFound} className="text-slate-400">Senha</Label>
                                <Link to="/esqueceu-senha" className="text-xs text-blue-500 hover:text-blue-400">Esqueceu?</Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="******"
                                className="bg-[#1e293b] border-slate-700 h-12 rounded-xl"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full h-14 text-lg font-black bg-blue-600 hover:bg-blue-500 rounded-2xl mt-4 shadow-lg shadow-blue-900/40" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : "ENTRAR NO SISTEMA"}
                        </Button>
                    </form>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0f172a] px-2 text-slate-500 font-bold">Ou explore sem cadastro</span></div>
                    </div>

                    <Link to="/logindemo">
                        <Button variant="outline" className="w-full h-12 border-slate-700 text-slate-400 hover:bg-slate-800 rounded-xl bg-transparent transition-all">
                            Acessar Ambiente de Demonstração
                        </Button>
                    </Link>
                </div>

                <p className="text-center text-xs text-slate-600">
                    &copy; 2026 Antigravity Systems. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
