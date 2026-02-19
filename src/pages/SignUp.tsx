import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, GraduationCap, Loader2, Check } from "lucide-react";

export default function SignUp() {
    const [role, setRole] = useState<'admin_ct' | 'professor'>('admin_ct');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        gymName: '' // Apenas p/ Admin CT
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Criar Auth User
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        role: role, // Metadata para Trigger
                        gym_name: role === 'admin_ct' ? formData.gymName : undefined
                    }
                }
            });

            if (error) throw error;

            // 2. Feedback e Redirecionamento
            toast({
                title: "Bem-vindo ao Tatame!",
                description: "Sua conta foi criada. Verifique seu email para confirmar.",
            });

            // Opcional: Se email confirmation estiver OFF, já loga direto
            if (data.session) {
                navigate('/dashboard');
            } else {
                navigate('/login'); // Ou tela de "Verifique seu email"
            }

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
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Criar Conta Grátis</h1>
                    <p className="text-slate-400">Teste todas as funções por 7 dias. Sem compromisso.</p>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div
                            onClick={() => setRole('admin_ct')}
                            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all flex flex-col items-center gap-3 relative ${role === 'admin_ct' ? 'bg-blue-600/10 border-blue-500' : 'bg-[#1e293b] border-slate-700 hover:border-slate-500'}`}
                        >
                            {role === 'admin_ct' && <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                            <Briefcase className={`w-8 h-8 ${role === 'admin_ct' ? 'text-blue-400' : 'text-slate-400'}`} />
                            <div className="text-center">
                                <p className={`font-bold ${role === 'admin_ct' ? 'text-blue-100' : 'text-slate-300'}`}>Dono de Academia</p>
                                <p className="text-xs text-slate-500 mt-1">Gestão completa do CT</p>
                            </div>
                        </div>

                        <div
                            onClick={() => setRole('professor')}
                            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all flex flex-col items-center gap-3 relative ${role === 'professor' ? 'bg-green-600/10 border-green-500' : 'bg-[#1e293b] border-slate-700 hover:border-slate-500'}`}
                        >
                            {role === 'professor' && <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                            <GraduationCap className={`w-8 h-8 ${role === 'professor' ? 'text-green-400' : 'text-slate-400'}`} />
                            <div className="text-center">
                                <p className={`font-bold ${role === 'professor' ? 'text-green-100' : 'text-slate-300'}`}>Professor</p>
                                <p className="text-xs text-slate-500 mt-1">Gestão de turmas avulsas</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignUp} className="space-y-4 max-w-md mx-auto">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input
                                placeholder="Seu nome"
                                className="bg-[#1e293b] border-slate-700 h-12"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {role === 'admin_ct' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label>Nome da Academia</Label>
                                <Input
                                    placeholder="Ex: Gracie Barra Centro"
                                    className="bg-[#1e293b] border-slate-700 h-12"
                                    value={formData.gymName}
                                    onChange={e => setFormData({ ...formData, gymName: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Email Profissional</Label>
                            <Input
                                type="email"
                                placeholder="voce@email.com"
                                className="bg-[#1e293b] border-slate-700 h-12"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Senha Segura</Label>
                            <Input
                                type="password"
                                placeholder="******"
                                className="bg-[#1e293b] border-slate-700 h-12"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" className={`w-full h-14 text-lg font-bold shadow-lg mt-6 ${role === 'admin_ct' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'}`} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "Iniciar Teste Grátis"}
                        </Button>

                        <p className="text-xs text-center text-slate-500 mt-4">
                            Ao criar conta, você aceita os Termos de Uso. <br />
                            Nenhum cartão de crédito necessário hoje.
                        </p>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-400">
                    Já tem conta? <Link to="/login" className="text-white underline font-bold">Entrar</Link>
                </p>
            </div>
        </div>
    );
}
