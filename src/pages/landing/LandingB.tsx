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
import { ArrowRight, Check, Play, TrendingUp, DollarSign, PieChart, BarChart3, Shield, Briefcase, Lock, Wallet } from 'lucide-react';
import { DemoLoginButtons } from '@/components/landing/DemoLoginButtons';

const LandingB = () => {
    const plansSectionRef = useRef<HTMLDivElement>(null);

    const scrollToPlans = () => {
        plansSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-600/30 scroll-smooth">
            {/* --- HERO SECTION (Fintech Style) --- */}
            <section className="relative pt-32 pb-24 overflow-hidden border-b border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0f172a] to-[#0f172a]" />

                <div className="container px-4 grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto relative z-10">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                            <Briefcase className="w-4 h-4" />
                            Gestão Financeira V1.0
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                            Assuma o Controle do <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                                Lucro do Seu Tatame
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
                            Sua academia é uma empresa. O BjjOss é o CFO que você sempre quis, mas nunca pôde pagar. DRE, Fluxo de Caixa e LTV em tempo real.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button onClick={scrollToPlans} size="xl" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all">
                                Começar Teste Grátis
                            </Button>
                            <div className="scale-90 origin-left opacity-80 hover:opacity-100 transition-opacity">
                                <DemoLoginButtons />
                            </div>
                        </div>

                        <div className="pt-8 flex items-center gap-4 text-sm text-slate-500 font-medium border-t border-slate-800 mt-8">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0f172a]" />
                                ))}
                            </div>
                            <p className="text-slate-400">Junte-se a +500 gestores profissionais.</p>
                        </div>
                    </div>

                    {/* Visual Hero Image (Dashboard Preview Dark) */}
                    <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200 group perspective-1000">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/40 to-green-500/40 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-1000" />
                        <div className="relative bg-[#1e293b] border border-slate-700 rounded-[1.5rem] shadow-2xl overflow-hidden p-4 transform rotate-y-6 group-hover:rotate-0 transition-transform duration-1000">
                            {/* Mock Dashboard UI Dark */}
                            <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 h-full">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
                                    <div className="h-8 w-8 bg-blue-600 rounded-full" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[#1e293b] p-4 rounded-lg shadow-sm border border-slate-700">
                                        <p className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2">
                                            <Wallet className="w-3 h-3 text-blue-400" /> Receita Mensal
                                        </p>
                                        <p className="text-3xl font-mono text-white mt-2">R$ 45.280</p>
                                        <div className="flex items-center text-green-400 text-xs mt-2 font-bold gap-1">
                                            <TrendingUp className="w-3 h-3" /> +12% vs mês anterior
                                        </div>
                                    </div>
                                    <div className="bg-[#1e293b] p-4 rounded-lg shadow-sm border border-slate-700">
                                        <p className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2">
                                            <PieChart className="w-3 h-3 text-green-400" /> Lucro Líquido
                                        </p>
                                        <p className="text-3xl font-mono text-white mt-2">R$ 28.150</p>
                                        <div className="flex items-center text-green-400 text-xs mt-2 font-bold gap-1">
                                            <TrendingUp className="w-3 h-3" /> +8% Recorde
                                        </div>
                                    </div>
                                </div>
                                {/* Mock Chart Dark */}
                                <div className="bg-[#1e293b] p-4 rounded-lg shadow-sm border border-slate-700 h-48 flex items-end gap-2 justify-between px-2 pb-2 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                                    {[40, 65, 50, 80, 60, 90, 100].map((h, i) => (
                                        <div key={i} className="w-full bg-blue-500/20 border-t-2 border-blue-500 rounded-t-sm hover:bg-blue-500 transition-colors group relative z-10" style={{ height: `${h}%` }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                                                + R$ {h * 100}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURE HIGHLIGHT (Financeiro Dark) --- */}
            <section className="py-24 bg-[#0f172a] relative">
                <div className="container px-4 max-w-6xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white">Por que o BjjOss dá ROI?</h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Investimento em gestão não é custo. É a diferença entre uma academia que paga as contas e uma que dá lucro.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-[#1e293b] p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-blue-500/50 hover:shadow-blue-900/20 transition-all group">
                            <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <DollarSign className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Cobrança Automática</h3>
                            <p className="text-slate-400">
                                Mensalidades no cartão de crédito recorrente. Se falhar, nosso robô re-tenta e notifica o aluno no WhatsApp.
                            </p>
                        </div>

                        <div className="bg-[#1e293b] p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-green-500/50 hover:shadow-green-900/20 transition-all group">
                            <div className="w-14 h-14 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <PieChart className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">DRE em Tempo Real</h3>
                            <p className="text-slate-400">
                                Demonstrativo de Resultado do Exercício na palma da mão. Saiba exatamente para onde vai cada centavo.
                            </p>
                        </div>

                        <div className="bg-[#1e293b] p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-purple-500/50 hover:shadow-purple-900/20 transition-all group">
                            <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Bloqueio de Catraca</h3>
                            <p className="text-slate-400">
                                Integração total. Aluno inadimplente não passa na catraca e o professor é avisado discretamente no app.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- DEMO MODE (Terminal Style) --- */}
            <section className="py-24 bg-[#0b1120] border-y border-slate-800">
                <div className="container px-4 text-center">
                    <div className="max-w-4xl mx-auto bg-[#1e293b] p-12 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white mb-4">Acesso Administrativo Temporário</h2>
                            <p className="text-slate-400 mb-8 max-w-xl mx-auto font-mono text-sm">
                     > ACCESS_LEVEL: ADMIN_CT <br />
                     > STATUS: GRANTED <br />
                     > SESSION_ID: DEMO_MODE_ACTIVE
                            </p>

                            <div className="scale-110">
                                <DemoLoginButtons />
                            </div>
                            <p className="text-xs text-slate-500 mt-8 font-mono">
                                * Ambiente sandbox criptografado. Dados reiniciados a cada 24h.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING (Table Style Dark) --- */}
            <section ref={plansSectionRef} className="py-24 bg-[#0f172a]" id="pricing">
                <div className="container px-4 max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-white text-center mb-16">Investimento Corporativo</h2>

                    <div className="grid lg:grid-cols-3 gap-0 shadow-2xl rounded-3xl overflow-hidden border border-slate-700 bg-[#1e293b]">
                        {PLANS.map((plan, idx) => (
                            <div key={plan.id} className={`p-10 border-b lg:border-b-0 lg:border-r border-slate-700 last:border-0 relative ${plan.highlight ? 'bg-blue-900/20' : 'bg-[#1e293b]'}`}>
                                {plan.highlight && (
                                    <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs font-bold uppercase tracking-widest text-center py-2">
                                        Recomendado pelo CFO
                                    </div>
                                )}

                                <div className="mb-8 mt-4">
                                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                    <p className="text-slate-400 text-sm mt-2 h-10">{plan.description}</p>
                                </div>

                                <div className="mb-8">
                                    <span className="text-4xl font-bold text-white tracking-tight">R$ {plan.price}</span>
                                    <span className="text-slate-500 font-medium">/mês</span>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                                            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Button className={`w-full h-12 font-bold shadow-lg ${plan.highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'}`}>
                                    {plan.cta}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-24 bg-gradient-to-b from-[#0f172a] to-blue-950 text-white text-center border-t border-slate-800">
                <div className="container px-4 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl font-bold"> Sua Academia, Profissional.</h2>
                    <p className="text-blue-200 text-xl">Não deixe dinheiro na mesa. Comece a gerir de verdade hoje.</p>
                    <Button size="xl" className="h-16 px-10 text-xl bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-105 transition-transform">
                        Quero Profissionalizar
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default LandingB;
