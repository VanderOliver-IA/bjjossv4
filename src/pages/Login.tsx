import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { VersionBadge } from "@/components/VersionBadge";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'password' | 'whatsapp'>('password');
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNotFound(false);

        try {
            if (loginMethod === 'whatsapp') {
                // Fluxo de OTP via WhatsApp
                const { data, error } = await supabase.rpc('generate_whatsapp_code', {
                    p_email: email || '', // Opcional se for só por fone
                    p_whatsapp: whatsapp
                });

                if (error) throw error;

                const result = data as any;
                if (!result.success) {
                    toast({ variant: "destructive", title: "Erro", description: result.message });
                    setLoading(false);
                    return;
                }

                // Chamar n8n
                try {
                    await fetch('https://n8n.olamundodigital.cloud/webhook/otp-send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            phone: whatsapp,
                            email: email,
                            code: result.code,
                            evolution_url: 'https://evolutionapi.olamundodigital.cloud',
                            evolution_instance: 'bjjoss',
                            evolution_apikey: 'FBD5B5D71191-437C-B19B-09C083D1BD71'
                        })
                    });
                } catch (n8nErr) {
                    console.error("Erro n8n:", n8nErr);
                }

                toast({ title: "Código enviado!", description: "Verifique seu WhatsApp." });
                navigate(`/verificar-whatsapp?whatsapp=${whatsapp}&email=${email}`);
                return;
            }

            // 1. Tentar verificar o perfil
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
                <div className="text-center space-y-2">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse" />
                        <h1 className="text-4xl font-black tracking-tighter relative z-10">
                            Bjj<span className="text-blue-500">Oss</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm font-medium italic">Sua jornada começa no Tatame.</p>
                </div>

                {/* Form Wrapper */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">

                    {/* Tabs / Toggle */}
                    <div className="grid grid-cols-2 gap-2 bg-[#1e293b] p-1 rounded-2xl">
                        <button
                            onClick={() => setLoginMethod('password')}
                            className={`py-2 text-xs font-black rounded-xl transition-all ${loginMethod === 'password' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            SENHA
                        </button>
                        <button
                            onClick={() => setLoginMethod('whatsapp')}
                            className={`py-2 text-xs font-black rounded-xl transition-all ${loginMethod === 'whatsapp' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            WHATSAPP
                        </button>
                    </div>

                    {/* Overlay para Cadastro */}
                    {notFound && (
                        <div className="absolute inset-0 bg-blue-600/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
                            <h3 className="text-2xl font-bold mb-3 uppercase tracking-tighter">Conta não encontrada</h3>
                            <p className="text-blue-100 mb-8 leading-relaxed">
                                Este email não está cadastrado. Deseja criar sua conta de 7 dias grátis agora?
                            </p>
                            <div className="flex flex-col w-full gap-4">
                                <Button
                                    onClick={() => navigate(`/cadastro?email=${email}`)}
                                    className="bg-white text-blue-600 hover:bg-slate-100 font-black h-14 rounded-2xl text-lg shadow-xl"
                                >
                                    CRIAR MEU ACESSO
                                </Button>
                                <Button
                                    onClick={() => setNotFound(false)}
                                    variant="ghost"
                                    className="text-white hover:bg-white/10 h-12 underline text-xs"
                                >
                                    Tentar outro email
                                </Button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        {loginMethod === 'password' ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-400 text-xs font-bold uppercase ml-1">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@jiujitsu.com"
                                        className="bg-[#1e293b] border-slate-700 h-12 rounded-xl focus:ring-2 ring-blue-500/20"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <Label htmlFor="password" disabled={notFound} className="text-slate-400 text-xs font-bold uppercase">Senha</Label>
                                        <Link to="/esqueceu-senha" className="text-[10px] text-blue-500 hover:text-blue-400 font-bold underline uppercase">Esqueceu?</Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="******"
                                        className="bg-[#1e293b] border-slate-700 h-12 rounded-xl focus:ring-2 ring-blue-500/20"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2 animate-in slide-in-from-right-2 duration-300">
                                <Label htmlFor="whatsapp" className="text-slate-400 text-xs font-bold uppercase ml-1">WhatsApp</Label>
                                <Input
                                    id="whatsapp"
                                    type="tel"
                                    placeholder="5511999999999"
                                    className="bg-[#1e293b] border-slate-700 h-12 rounded-xl focus:ring-2 ring-green-500/20"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    required
                                />
                                <p className="text-[10px] text-slate-500 mt-2 ml-1 italic">Dica: Inclua o código do país (Ex: 55 para Brasil)</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className={`w-full h-14 text-lg font-black rounded-2xl mt-4 shadow-lg transition-all ${loginMethod === 'password' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40' : 'bg-green-600 hover:bg-green-500 shadow-green-900/40'
                                }`}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                loginMethod === 'password' ? "ENTRAR NO SISTEMA" : "ENVIAR CÓDIGO WHATSAPP"
                            )}
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
            <VersionBadge />
        </div>
    );
}
