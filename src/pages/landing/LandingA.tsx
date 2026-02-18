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
import { ArrowRight, Check, Star, Play, ScanFace, TrendingUp, Smartphone, ShieldCheck, Sword } from 'lucide-react';
import { DemoLoginButtons } from '@/components/landing/DemoLoginButtons';

const LandingA = () => {
    const plansSectionRef = useRef<HTMLDivElement>(null);

    const scrollToPlans = () => {
        plansSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 font-inter scroll-smooth">
            {/* --- HERO SECTION (High Tech) --- */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
                </div>

                <div className="container relative z-10 px-4 text-center space-y-8 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-sm font-medium text-primary tracking-wide uppercase">Nova Tecnologia V1.0 Disponível</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] animate-in fade-in zoom-in duration-1000 delay-100">
                        A Primeira Inteligência Artificial <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                            Faixa Preta em Gestão
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Esqueça a chamada no papel. O BjjOss usa reconhecimento facial para marcar presença, cobra mensalidades automaticamente e dobra o lucro do seu CT.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <Button
                            onClick={scrollToPlans}
                            size="xl"
                            className="bg-white text-black hover:bg-white/90 font-bold text-lg h-14 px-8 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
                        >
                            Começar Agora
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="xl" className="border-white/20 hover:bg-white/5 h-14 px-8 text-lg hover:scale-105 transition-transform">
                            <Play className="mr-2 h-5 w-5 fill-white" />
                            Ver Vídeo Demo
                        </Button>
                    </div>

                    <div className="pt-12 flex items-center justify-center gap-8 text-white/30 text-sm font-semibold uppercase tracking-widest animate-in fade-in duration-1000 delay-500">
                        <span>Usado por:</span>
                        <div className="flex gap-6 filters grayscale opacity-50 hover:opacity-100 transition-opacity">
                            <span>Alliance</span>
                            <span>Gracie Barra</span>
                            <span>Checkmat</span>
                            <span>Atos</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURE DEEP DIVE (Reconhecimento Facial) --- */}
            <section className="py-24 bg-[#080808] border-y border-white/5 relative overflow-hidden">
                <div className="container px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 relative z-10">
                        <div className="inline-block p-3 rounded-2xl bg-primary/10 border border-primary/20">
                            <ScanFace className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
                            Chamada por Foto.<br />O Fim da Burocracia.
                        </h2>
                        <div className="space-y-6 text-lg text-white/70">
                            <p>
                                Imagine terminar o treino, tirar uma foto da galera e ir embora.
                                Nossa IA scaneia a imagem, identifica cada rosto em 0.3 segundos e marca presença no sistema.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-500" />
                                    </div>
                                    <span>Funciona com kimono, suor e pouca luz.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-500" />
                                    </div>
                                    <span>Detecta visitantes e alunos de teste.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-500" />
                                    </div>
                                    <span>Sincroniza com graduação (graus automáticos).</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Visual Demo Fake UI */}
                    <div className="relative group perspective-1000">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                        <div className="relative bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transform group-hover:rotate-y-2 transition-transform duration-700">
                            {/* Header Fake */}
                            <div className="h-12 bg-black/50 border-b border-white/10 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            {/* Content Image Scan */}
                            <div className="relative aspect-video bg-black group overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" />

                                {/* Scan Beam */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_30px_#3b82f6] animate-[scan_3s_ease-in-out_infinite]" />

                                {/* Face Markers Fake */}
                                <div className="absolute top-1/4 left-1/4 w-12 h-12 border-2 border-primary/80 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-end justify-center pb-1">
                                    <span className="text-[8px] bg-primary text-black px-1 font-bold">ALUNO 1</span>
                                </div>
                                <div className="absolute bottom-1/3 right-1/3 w-10 h-10 border-2 border-green-500/80 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-end justify-center pb-1">
                                    <span className="text-[8px] bg-green-500 text-black px-1 font-bold">ALUNO 2</span>
                                </div>
                            </div>

                            {/* Stats Panel Fake */}
                            <div className="p-6 bg-[#0A0A0A]">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-white/50 text-sm font-mono">SCAN_STATUS: COMPLETE</span>
                                    <span className="text-green-500 text-sm font-bold font-mono">SUCCESS (98%)</span>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[98%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- DEMO INTERATIVA (Login Buttons) --- */}
            <section className="py-24 bg-gradient-to-b from-[#080808] via-primary/5 to-[#080808] border-y border-white/5">
                <div className="container px-4 text-center space-y-8">
                    <h2 className="text-3xl font-bold mb-4">Veja o Sistema Funcionando Agora</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                        Sem cadastro, sem cartão de crédito. Acesse nosso ambiente de demonstração real e veja como o BjjOss organiza um CT.
                    </p>
                    <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px]" />
                        <DemoLoginButtons />
                    </div>
                </div>
            </section>

            {/* --- PLANS SECTION (Pricing Table) --- */}
            <section ref={plansSectionRef} className="py-24 relative" id="pricing">
                <div className="container px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Investimento Faixa Preta</h2>
                        <p className="text-xl text-white/50">Escolha o plano ideal para o tamanho do seu sonho.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {PLANS.map((plan) => (
                            <div key={plan.id} className={`group relative rounded-3xl p-8 border ${plan.highlight ? 'bg-primary/5 border-primary/50 shadow-[0_0_50px_rgba(59,130,246,0.1)]' : 'bg-white/[0.02] border-white/10 hover:border-white/20'} transition-all duration-300 hover:-translate-y-2`}>
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black font-bold px-4 py-1 rounded-full text-sm shadow-lg">
                                        {plan.badge}
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-extrabold text-white">R$ {plan.price}</span>
                                    {plan.price !== 'Sob Consulta' && <span className="text-white/50">/mês</span>}
                                </div>
                                <p className="text-white/60 text-sm mb-8 h-10">{plan.description}</p>

                                <Button className={`w-full mb-8 font-bold ${plan.highlight ? 'bg-primary text-black hover:bg-primary/90' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                    {plan.cta}
                                </Button>

                                <ul className="space-y-4">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-white/80">
                                            <Check className={`w-4 h-4 mt-0.5 ${plan.highlight ? 'text-primary' : 'text-white/50'}`} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FAQ SECTION --- */}
            <section className="py-24 bg-[#080808] border-y border-white/5">
                <div className="container px-4 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">Perguntas Frequentes</h2>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {FAQ.map((item, idx) => (
                            <AccordionItem key={idx} value={`item-${idx}`} className="border border-white/10 rounded-xl px-4 bg-white/[0.02]">
                                <AccordionTrigger className="text-left text-lg hover:text-primary transition-colors hover:no-underline py-6">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-white/60 pb-6 text-base leading-relaxed">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* --- FOOTER (CTA Final) --- */}
            <footer className="py-24 bg-black border-t border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
                <div className="container px-4 text-center relative z-10 space-y-8">
                    <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white">Pronto para evoluir?</h2>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto">
                        Junte-se a elite do Jiu-Jitsu. Teste grátis por 7 dias e veja a mágica acontecer.
                    </p>
                    <Button size="xl" className="h-16 px-10 text-xl font-bold rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                        Criar Conta Grátis
                    </Button>
                    <p className="text-sm text-white/30 pt-8">
                        © 2026 BjjOss V1. Feito por Faixas Pretas para Faixas Pretas.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingA;
