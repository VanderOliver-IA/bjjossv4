import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoGuard } from '@/contexts/DemoGuardContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export function DemoGuardModal() {
    const { showModal, setShowModal, modulesAccessed, demoStartTime } = useDemoGuard();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [step, setStep] = useState<'cta' | 'form'>('cta');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', whatsapp: '', academy: '' });

    const handleCaptureLead = async () => {
        if (!form.name || !form.email || !form.whatsapp) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha Nome, Email e WhatsApp.' });
            return;
        }

        setLoading(true);
        try {
            const demoSeconds = Math.floor((Date.now() - demoStartTime) / 1000);

            const { error } = await supabase.rpc('capture_demo_lead', {
                p_name: form.name,
                p_email: form.email,
                p_whatsapp: form.whatsapp,
                p_academy_name: form.academy || null,
                p_modules: modulesAccessed,
            });

            if (error) throw error;

            toast({ title: '🎉 Dados recebidos!', description: 'Redirecionando para o cadastro completo...' });
            setShowModal(false);

            // Redireciona para cadastro com dados pré-preenchidos
            const params = new URLSearchParams({
                name: form.name,
                email: form.email,
                whatsapp: form.whatsapp,
            });
            navigate(`/cadastro?${params.toString()}`);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Erro', description: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="bg-[#050510] border-blue-500/20 text-white max-w-md p-0 overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                    <div className="relative z-10">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black">FUNCIONALIDADE PREMIUM</h2>
                        <p className="text-blue-100 text-sm mt-2">
                            No modo demonstração você pode <strong>visualizar tudo</strong>, mas para cadastrar, editar ou excluir dados, você precisa de uma conta real.
                        </p>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {step === 'cta' ? (
                        <>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-400" />
                                    <p className="font-bold text-sm">Cadastre-se e use TUDO gratuitamente!</p>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Crie sua conta agora e tenha acesso completo a todas as funcionalidades. Sem compromisso.
                                </p>
                            </div>

                            <Button
                                onClick={() => setStep('form')}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-500 font-black text-lg rounded-2xl gap-2"
                            >
                                QUERO COMEÇAR AGORA
                                <ArrowRight className="w-5 h-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => setShowModal(false)}
                                className="w-full text-slate-500 hover:text-white text-sm"
                            >
                                Continuar apenas visualizando
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                Preencha para liberar seu acesso
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-slate-400 text-xs">Nome completo *</Label>
                                    <Input
                                        value={form.name}
                                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Seu nome"
                                        className="bg-[#0f172a] border-slate-800 h-12 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-400 text-xs">Email *</Label>
                                    <Input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="seu@email.com"
                                        className="bg-[#0f172a] border-slate-800 h-12 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-400 text-xs">WhatsApp *</Label>
                                    <Input
                                        value={form.whatsapp}
                                        onChange={(e) => setForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                                        placeholder="(11) 99999-9999"
                                        className="bg-[#0f172a] border-slate-800 h-12 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-400 text-xs">Nome da sua academia (opcional)</Label>
                                    <Input
                                        value={form.academy}
                                        onChange={(e) => setForm(prev => ({ ...prev, academy: e.target.value }))}
                                        placeholder="Ex: Gracie Barra Centro"
                                        className="bg-[#0f172a] border-slate-800 h-12 rounded-xl"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleCaptureLead}
                                disabled={loading}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-500 font-black text-lg rounded-2xl gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <Rocket className="w-5 h-5" />
                                        CRIAR MINHA CONTA GRÁTIS
                                    </>
                                )}
                            </Button>

                            <p className="text-[10px] text-center text-slate-600">
                                Ao continuar, você concorda com nossa Política de Privacidade e termos de uso conforme a LGPD.
                            </p>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
