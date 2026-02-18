import { useRef } from 'react';
import { PLANS, TESTIMONIALS, FAQ } from '@/data/landingData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, Check, Star, Play, ScanFace, TrendingUp, Smartphone, ShieldCheck, Sword, Zap, AlertTriangle, Lock } from 'lucide-react';
import { DemoLoginButtons } from '@/components/landing/DemoLoginButtons';

const LandingA = () => {
    const plansSectionRef = useRef<HTMLDivElement>(null);

    const scrollToPlans = () => {
        plansSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-purple-600/30 font-inter scroll-smooth">
            {/* --- HERO SECTION (High Tech / Dark Aggressive) --- */}
            <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[150px]" />
                    {/* Imagem de Impacto: Mestre Dark / Kimono */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#020202]/50 via-[#020202]/80 to-[#020202]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#020202]/60 to-[#020202]" />
                </div>

                <div className="container relative z-10 px-4 text-center space-y-10 max-w-5xl mx-auto pt-20">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-8 duration-1000 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                        </span>
                        <span className="text-sm font-bold text-purple-400 tracking-widest uppercase">Sistema V1.0 - Acesso Liberado</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1] animate-in fade-in zoom-in duration-1000 delay-100 drop-shadow-2xl">
                        A PRIMEIRA IA <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                            FAIXA PRETA
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Enquanto você perde tempo com planilhas e chamadas manuais, seus concorrentes usam o <strong className="text-white">BjjOss</strong> para automatizar tudo. <br />
                        Escaneie o tatame, cobre mensalidades no piloto automático e foque no treino.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        {/* CTA PRINCIPAL - DEMO DIRETA */}
                        <div className="w-full max-w-md scale-110 shadow-[0_0_60px_rgba(168,85,247,0.2)]">
                            <DemoLoginButtons />
                        </div>
                        <p className="text-xs text-white/30 uppercase tracking-widest mt-4 sm:mt-0 sm:absolute sm:-bottom-16">
                            * Sem cartão de crédito. Aesso imediato ao ambiente de teste.
                        </p>
                    </div>
                </div>
            </section>

            {/* --- PAIN SECTION (Gatilho da Dor) --- */}
            <section className="py-24 bg-[#050505] border-y border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-red-900/5 blur-[100px]" />
                <div className="container px-4 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 text-red-500 font-bold tracking-widest uppercase text-sm">
                                <AlertTriangle className="w-5 h-5" />
                                Pare de Perder Dinheiro
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                Sua academia tem um <span className="text-red-500">furo no balde</span> e você nem sabe.
                            </h2>
                            <p className="text-lg text-slate-400">
                                A cada aluno que sai sem pagar, a cada chamada esquecida, a cada gradução atrasada... você perde autoridade e lucro.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Alunos treinando de graça sem você ver.",
                                    "Horas perdidas conferindo listas de papel.",
                                    "Zero previsibilidade de caixa no fim do mês."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-colors">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <span className="text-slate-300 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Visual de Caos/Perda */}
                        <div className="relative h-[400px] rounded-3xl overflow-hidden border border-white/10 group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                            <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute bottom-8 left-8 right-8 z-20">
                                <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 p-6 rounded-2xl">
                                    <p className="text-red-400 font-mono text-xs mb-2">RELATÓRIO DE EVASÃO</p>
                                    <p className="text-2xl font-bold text-white mb-1">- R$ 4.500,00</p>
                                    <p className="text-sm text-white/50">Perdidos em mensalidades não cobradas este mês.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SOLUTION (IA & CRM) --- */}
            <section className="py-24 bg-[#080808] border-b border-white/5">
                <div className="container px-4">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold">A Tecnologia que <span className="text-purple-500">Luta por Você</span></h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Automatizamos o chato para você focar no tatame.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {/* Card 1: Facial Rec */}
                        <Card className="bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group overflow-hidden">
                            <div className="h-48 bg-black relative overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=2672&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                                <ScanFace className="absolute bottom-4 left-4 w-8 h-8 text-purple-500" />
                            </div>
                            <CardContent className="p-8 space-y-4">
                                <h3 className="text-2xl font-bold text-white">Chamada Facial</h3>
                                <p className="text-slate-400">
                                    Esqueça as listas. Aponte a câmera pro tatame e nossa IA identifica quem treinou, quem faltou e quem é visitante.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Card 2: CRM Financeiro */}
                        <Card className="bg-white/5 border-white/10 hover:border-green-500/50 hover:bg-green-500/5 transition-all group overflow-hidden">
                            <div className="h-48 bg-black relative overflow-hidden">
                                {/* Imagem Financeiro */}
                                <div className="absolute inset-0 flex items-center justify-center bg-[#0F172A]">
                                    <div className="w-3/4 space-y-2 opacity-80 group-hover:scale-105 transition-transform">
                                        <div className="h-2 w-full bg-white/10 rounded" />
                                        <div className="h-2 w-2/3 bg-white/10 rounded" />
                                        <div className="flex gap-2 pt-4">
                                            <div className="h-16 w-4 bg-green-500/50 rounded-t" />
                                            <div className="h-24 w-4 bg-green-500/70 rounded-t" />
                                            <div className="h-20 w-4 bg-green-500/60 rounded-t" />
                                        </div>
                                    </div>
                                </div>
                                <DollarSign className="absolute bottom-4 left-4 w-8 h-8 text-green-500" />
                            </div>
                            <CardContent className="p-8 space-y-4">
                                <h3 className="text-2xl font-bold text-white">CRM Financeiro</h3>
                                <p className="text-slate-400">
                                    Cobrança recorrente no cartão. Se falhar, o sistema bloqueia a catraca e avisa no WhatsApp. Inadimplência Zero.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Card 3: Retenção */}
                        <Card className="bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group overflow-hidden">
                            <div className="h-48 bg-black relative overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                                <Users className="absolute bottom-4 left-4 w-8 h-8 text-blue-500" />
                            </div>
                            <CardContent className="p-8 space-y-4">
                                <h3 className="text-2xl font-bold text-white">Retenção de Alunos</h3>
                                <p className="text-slate-400">
                                    Saiba quem está faltando antes que eles desistam. O sistema gera alertas de "Risco de Evasão" automaticamente.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* --- DEMO INTERATIVA (Sticky CTA) --- */}
            <section className="py-24 bg-[#020202] text-center">
                <div className="container px-4">
                    <div className="max-w-4xl mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px]" />

                        <h2 className="text-4xl font-bold mb-8">Pare de imaginar. <span className="text-purple-400">Veja funcionando.</span></h2>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            Liberamos um acesso de administrador para você agora. Clique abaixo e entre no sistema como se fosse seu.
                        </p>

                        <div className="flex justify-center">
                            <DemoLoginButtons />
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-green-400 font-mono">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Ambiente de Teste Online: 12 usuários conectados agora.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PLANS (Pricing Dark) --- */}
            <section ref={plansSectionRef} className="py-24 bg-[#050505]" id="pricing">
                <div className="container px-4">
                    <h2 className="text-4xl text-center font-bold mb-16">Planos Feitos para Tatame</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {PLANS.map((plan) => (
                            <div key={plan.id} className={`group relative rounded-3xl p-8 border backdrop-blur-sm ${plan.highlight ? 'bg-white/5 border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)] z-10' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}>
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-6 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg">
                                        {plan.badge}
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <div className="text-4xl font-black text-white">R$ {plan.price}</div>
                                    {plan.price !== 'Sob Consulta' && <span className="text-white/40 font-medium">/mês</span>}
                                </div>
                                <p className="text-white/50 text-sm mb-8 h-10">{plan.description}</p>
                                <Button className={`w-full h-12 rounded-xl font-bold mb-8 transition-all ${plan.highlight ? 'bg-white text-black hover:bg-white/90 hover:scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                    {plan.cta}
                                </Button>
                                <ul className="space-y-4">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                                            <Check className={`w-4 h-4 mt-0.5 ${plan.highlight ? 'text-purple-400' : 'text-slate-600'}`} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-12 bg-black border-t border-white/10 text-center">
                <div className="container px-4 space-y-8">
                    <h2 className="text-3xl font-bold tracking-tighter">BjjOss V1</h2>
                    <div className="flex justify-center gap-8 text-slate-500 text-sm">
                        <span className="hover:text-white cursor-pointer">Termos de Uso</span>
                        <span className="hover:text-white cursor-pointer">Privacidade</span>
                        <span className="hover:text-white cursor-pointer">Suporte Ninja</span>
                    </div>
                    <p className="text-slate-600 text-xs">© 2026 Antigravity Systems.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingA;
