import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, GraduationCap, Loader2, Check, Smartphone } from "lucide-react";

export default function SignUp() {
    const [searchParams] = useSearchParams();
    const [role, setRole] = useState<'admin_ct' | 'professor'>('admin_ct');
    const [formData, setFormData] = useState({
        name: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        whatsapp: searchParams.get('whatsapp') || '',
        password: '',
        gymName: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Sincroniza se os params mudarem (ex: usuário volta do modal de lead)
    useEffect(() => {
        if (searchParams.get('name') || searchParams.get('email') || searchParams.get('whatsapp')) {
            setFormData(prev => ({
                ...prev,
                name: searchParams.get('name') || prev.name,
                email: searchParams.get('email') || prev.email,
                whatsapp: searchParams.get('whatsapp') || prev.whatsapp
            }));
        }
    }, [searchParams]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.whatsapp) {
            toast({ variant: "destructive", title: "WhatsApp obrigatório", description: "Precisamos do seu WhatsApp para enviar o código de acesso." });
            return;
        }

        setLoading(true);

        try {
            // 1. Criar Auth User com metadados estendidos
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        whatsapp: formData.whatsapp,
                        role: role,
                        gym_name: role === 'admin_ct' ? formData.gymName : undefined
                    }
                }
            });

            if (error) throw error;

            // 2. Notificar sobre a verificação
            toast({
                title: "Quase lá! 🥊",
                description: "Sua conta foi pré-criada. Agora vamos validar seu WhatsApp.",
            });

            // 3. Redirecionar para verificação WhatsApp
            const params = new URLSearchParams({
                email: formData.email,
                whatsapp: formData.whatsapp
            });
            navigate(`/verificar-whatsapp?${params.toString()}`);

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro no cadastro",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-4 selection:bg-blue-600/30">
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-700">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter italic">BjjOss</h1>
                    <h2 className="text-2xl font-bold tracking-tight">Criar Conta Grátis</h2>
                    <p className="text-slate-400">Teste todas as funções por 7 dias. Sem compromisso.</p>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] group-hover:bg-blue-600/20 transition-all duration-700" />

                    {/* Role Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                        <div
                            onClick={() => setRole('admin_ct')}
                            className={`cursor-pointer rounded-3xl p-6 border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${role === 'admin_ct' ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-[#1e293b]/50 border-slate-800 hover:border-slate-600'}`}
                        >
                            {role === 'admin_ct' && <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                            <Briefcase className={`w-10 h-10 ${role === 'admin_ct' ? 'text-blue-400' : 'text-slate-400'}`} />
                            <div className="text-center">
                                <p className={`font-black text-lg ${role === 'admin_ct' ? 'text-blue-500' : 'text-slate-300'}`}>Dono de Academia</p>
                                <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">Gestão completa</p>
                            </div>
                        </div>

                        <div
                            onClick={() => setRole('professor')}
                            className={`cursor-pointer rounded-3xl p-6 border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${role === 'professor' ? 'bg-green-600/10 border-green-500 shadow-lg shadow-green-500/10' : 'bg-[#1e293b]/50 border-slate-800 hover:border-slate-600'}`}
                        >
                            {role === 'professor' && <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                            <GraduationCap className={`w-10 h-10 ${role === 'professor' ? 'text-green-400' : 'text-slate-400'}`} />
                            <div className="text-center">
                                <p className={`font-black text-lg ${role === 'professor' ? 'text-green-500' : 'text-slate-300'}`}>Professor</p>
                                <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">Turmas e Alunos</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignUp} className="space-y-5 max-w-md mx-auto">
                        <div className="space-y-2">
                            <Label className="text-slate-400 font-bold uppercase text-[10px] ml-2 tracking-widest">Nome Completo</Label>
                            <Input
                                placeholder="Seu nome"
                                className="bg-[#1e293b] border-slate-800 h-14 rounded-2xl focus:border-blue-500/50"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-400 font-bold uppercase text-[10px] ml-2 tracking-widest">WhatsApp</Label>
                            <div className="relative">
                                <Input
                                    placeholder="(11) 99999-9999"
                                    className="bg-[#1e293b] border-slate-800 h-14 rounded-2xl pl-12 focus:border-blue-500/50"
                                    type="tel"
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    required
                                />
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            </div>
                        </div>

                        {role === 'admin_ct' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className="text-slate-400 font-bold uppercase text-[10px] ml-2 tracking-widest">Nome da Academia</Label>
                                <Input
                                    placeholder="Ex: Gracie Barra Centro"
                                    className="bg-[#1e293b] border-slate-800 h-14 rounded-2xl focus:border-blue-500/50"
                                    value={formData.gymName}
                                    onChange={e => setFormData({ ...formData, gymName: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-slate-400 font-bold uppercase text-[10px] ml-2 tracking-widest">Email Profissional</Label>
                            <Input
                                type="email"
                                placeholder="voce@email.com"
                                className="bg-[#1e293b] border-slate-800 h-14 rounded-2xl focus:border-blue-500/50"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-400 font-bold uppercase text-[10px] ml-2 tracking-widest">Senha de Acesso</Label>
                            <Input
                                type="password"
                                placeholder="No mínimo 6 caracteres"
                                className="bg-[#1e293b] border-slate-800 h-14 rounded-2xl focus:border-blue-500/50"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" className={`w-full h-16 text-xl font-black italic shadow-2xl mt-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 ${role === 'admin_ct' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-green-600 hover:bg-green-500 shadow-green-500/20'}`} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "INICIAR TESTE GRÁTIS"}
                        </Button>

                        <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
                            <Check className="w-3 h-3" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Cartão de crédito não necessário</p>
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-400">
                    Já tem conta? <Link to="/login" className="text-white underline font-bold hover:text-blue-400 transition-colors">Entrar</Link>
                </p>
            </div>
        </div>
    );
}
