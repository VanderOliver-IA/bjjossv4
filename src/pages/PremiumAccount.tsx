import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Smartphone,
    CheckCircle2,
    Sparkles,
    Rocket,
    Crown,
    ShieldCheck,
    MessageSquare,
    ArrowRight
} from 'lucide-react';

export default function PremiumAccount() {
    const navigate = useNavigate();
    const WHATSAPP_NUMBER = '5521999757549';
    const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Olá Vanderson, estou usando o BjjOss e gostaria de garantir meu acesso Pro!`;

    const plans = [
        {
            name: 'Academy Pro',
            price: 'Consultar',
            description: 'Gestão completa para o seu dojô sem limites.',
            features: [
                'Alunos e Turmas Ilimitados',
                'Controle Financeiro Completo',
                'Gestão de Graduação e Presença',
                'CRM de Vendas Integrado',
                'Suporte VIP via WhatsApp',
                'Multi-professores e Multi-unidades'
            ],
            popular: true,
            icon: Crown,
            color: 'blue'
        }
    ];

    return (
        <div className="min-h-screen bg-[#020202] py-20 px-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-5xl mx-auto space-y-16 relative z-10">
                {/* Header */}
                <div className="text-center space-y-6">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px]">
                        <Sparkles className="w-3 h-3 mr-2 inline fill-blue-500" />
                        Nível Profissional ativado
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-white">
                        Domine o seu <span className="text-blue-600">Tatame</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Sua jornada gratuita expirou ou você deseja liberar todo o poder do BjjOss?
                        Garanta agora o acesso PRO e profissionalize sua gestão.
                    </p>
                </div>

                {/* Plan Card */}
                <div className="max-w-md mx-auto">
                    {plans.map((plan) => (
                        <Card key={plan.name} className="bg-[#0f172a] border-blue-500/30 rounded-[48px] overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02] relative group">
                            <div className="absolute inset-0 bg-blue-600/[0.02] group-hover:bg-blue-600/[0.05] transition-colors" />

                            <CardContent className="p-10 space-y-10 relative">
                                {/* Plan Header */}
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-blue-600/20 rounded-[32px] mx-auto flex items-center justify-center border border-blue-500/30">
                                        <plan.icon className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <h3 className="text-3xl font-black italic uppercase italic tracking-tighter">{plan.name}</h3>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-5xl font-black tracking-tighter text-blue-500">{plan.price}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-4">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <div className="mt-1 bg-green-500/20 rounded-full p-0.5">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Action */}
                                <div className="space-y-4 pt-4">
                                    <a href={WHATSAPP_URL} target="_blank">
                                        <Button className="w-full h-20 bg-blue-600 hover:bg-blue-500 rounded-[28px] text-xl font-black italic uppercase tracking-tight shadow-2xl shadow-blue-900/40 gap-3 group/btn">
                                            <MessageSquare className="w-6 h-6" />
                                            GARANTIR ACESSO PRO
                                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                                        </Button>
                                    </a>

                                    <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                        <ShieldCheck className="w-4 h-4" />
                                        Pagamento 100% Seguro & Suporte Vitalício
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Social Proof / Trust */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-slate-800 pt-16">
                    <div className="space-y-2">
                        <h4 className="text-white font-black italic text-xl uppercase tracking-tight">Suporte faixa preta</h4>
                        <p className="text-xs text-slate-500 font-medium">Equipe brasileira disponível 24/7 para tirar suas dúvidas.</p>
                    </div>
                    <div className="space-y-2 border-x border-slate-800 px-8">
                        <h4 className="text-white font-black italic text-xl uppercase tracking-tight">Sem fidelidade</h4>
                        <p className="text-xs text-slate-500 font-medium">Cancele quando quiser, sem letras miúdas ou taxas extras.</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-white font-black italic text-xl uppercase tracking-tight">Tudo em um só lugar</h4>
                        <p className="text-xs text-slate-500 font-medium">Substitua planilhas e cadernos por uma plataforma pro.</p>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="text-center">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-white font-bold opacity-50 hover:opacity-100 transition-all">
                        Voltar para o painel de demonstração
                    </Button>
                </div>
            </div>
        </div>
    );
}
