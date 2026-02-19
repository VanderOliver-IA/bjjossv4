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
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Erro no acesso",
                    description: error.message === "Invalid login credentials"
                        ? "Email ou senha incorretos."
                        : error.message,
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
                    <h2 className="text-xl font-bold text-slate-300">Acesse sua conta</h2>
                    <p className="text-slate-500 text-sm">
                        Ainda não tem conta? <Link to="/cadastro" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">Comece Grátis</Link>
                    </p>
                </div>

                {/* Form */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-400">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="mestre@jiujitsu.com"
                                className="bg-[#1e293b] border-slate-700 text-white focus:border-blue-500 transition-colors h-12"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-slate-400">Senha</Label>
                                <Link to="/esqueceu-senha" className="text-xs text-blue-500 hover:text-blue-400">Esqueceu?</Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="******"
                                className="bg-[#1e293b] border-slate-700 text-white focus:border-blue-500 transition-colors h-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all rounded-xl mt-4" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Entrar no Sistema"}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-700" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0f172a] px-2 text-slate-500">Ou</span></div>
                    </div>

                    <Link to="/logindemo">
                        <Button variant="outline" className="w-full h-12 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl bg-transparent">
                            Acessar Ambiente de Demo
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
