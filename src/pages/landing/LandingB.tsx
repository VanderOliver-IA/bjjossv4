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
import { ArrowRight, Check, Play, TrendingUp, DollarSign, PieChart, BarChart3, Shield, Briefcase } from 'lucide-react';
import { DemoLoginButtons } from '@/components/landing/DemoLoginButtons';

const LandingB = () => {
    const plansSectionRef = useRef<HTMLDivElement>(null);

    const scrollToPlans = () => {
        plansSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600/20 scroll-smooth">
            {/* --- HERO SECTION (Corporate) --- */}
            <section className="relative pt-32 pb-24 border-b border-slate-200 overflow-hidden bg-white">
                <div className="container px-4 grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                            <Briefcase className="w-4 h-4" />
                            Gestão Profissional V1.0
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                            Assuma o Controle do <br />
                            <span className="text-blue-600 relative">
                                Lucro do Seu Tatame
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                            Pare de perder alunos por desorganização. O BjjOss automatiza cobranças, recupera inadimplentes e profissionaliza sua gestão financeira.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button onClick={scrollToPlans} size="xl" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-600/20 hover:-translate-y-1 transition-all">
                                Começar Teste Grátis
                            </Button>
                            <Button variant="outline" size="xl" className="h-14 px-8 text-lg border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-semibold hover:-translate-y-1 transition-all">
                                Ver Apresentação
                            </Button>
                        </div>

                        <div className="pt-8 flex items-center gap-4 text-sm text-slate-500 font-medium">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                                ))}
                            </div>
                            <p>Junte-se a +500 gestores profissionais.</p>
                        </div>
                    </div>

                    {/* Visual Hero Image (Dashboard Preview) */}
                    <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-[2rem] blur-2xl transform rotate-3" />
                        <div className="relative bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl overflow-hidden p-2">
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                {/* Mock Dashboard UI */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold uppercase">Receita Mensal</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">R$ 45.280</p>
                                        <div className="flex items-center text-green-600 text-xs mt-2 font-bold gap-1">
                                            <TrendingUp className="w-3 h-3" /> +12% vs mês anterior
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold uppercase">Lucro Líquido</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">R$ 28.150</p>
                                        <div className="flex items-center text-green-600 text-xs mt-2 font-bold gap-1">
                                            <TrendingUp className="w-3 h-3" /> +8% Recorde
                                        </div>
                                    </div>
                                </div>
                                {/* Mock Chart */}
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 h-48 flex items-end gap-2 justify-between px-2 pb-2">
                                    {[40, 65, 50, 80, 60, 90, 100].map((h, i) => (
                                        <div key={i} className="w-full bg-blue-100 rounded-t-sm hover:bg-blue-600 transition-colors group relative" style={{ height: `${h}%` }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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

            {/* --- FEATURE HIGHLIGHT (Financeiro) --- */}
            <section className="py-24 bg-slate-50">
                <div className="container px-4 max-w-6xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Por que o BjjOss dá ROI?</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Investimento em gestão não é custo. É a diferença entre uma academia que paga as contas e uma que dá lucro.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Cobrança Automática</h3>
                            <p className="text-slate-600">
                                Mensalidades no cartão de crédito recorrente. Se falhar, nosso robô re-tenta e notifica o aluno no WhatsApp.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <PieChart className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">DRE em Tempo Real</h3>
                            <p className="text-slate-600">
                                Demonstrativo de Resultado do Exercício na palma da mão. Saiba exatamente para onde vai cada centavo.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Bloqueio de Catraca</h3>
                            <p className="text-slate-600">
                                Integração total. Aluno inadimplente não passa na catraca e o professor é avisado discretamente no app.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- DEMO MODE (Clean UI) --- */}
            <section className="py-24 bg-white border-y border-slate-200">
                <div className="container px-4 text-center">
                    <div className="max-w-3xl mx-auto bg-slate-50 p-12 rounded-3xl border border-slate-200 shadow-xl">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Teste o Sistema Agora (Sem Cadastro)</h2>
                        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
                            Acesse nosso ambiente de demonstração com dados fictícios e veja os relatórios gerenciais na prática.
                        </p>

                        {/* Custom Demo Component Injection - Reusing logic but slightly diff style via CSS if needed, 
                   but here just render the component as is, it's neutral enough */}
                        <div className="scale-110 origin-top">
                            <DemoLoginButtons />
                        </div>
                        <p className="text-xs text-slate-400 mt-8">
                            * Acesso seguro em ambiente sandbox. Seus dados não serão salvos.
                        </p>
                    </div>
                </div>
            </section>

            {/* --- PRICING (Table Style) --- */}
            <section ref={plansSectionRef} className="py-24 bg-slate-50" id="pricing">
                <div className="container px-4 max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-slate-900 text-center mb-16">Planos Corporativos</h2>

                    <div className="grid lg:grid-cols-3 gap-0 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 bg-white">
                        {PLANS.map((plan, idx) => (
                            <div key={plan.id} className={`p-10 border-b lg:border-b-0 lg:border-r border-slate-100 last:border-0 relative ${plan.highlight ? 'bg-blue-50/30' : 'bg-white'}`}>
                                {plan.highlight && (
                                    <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs font-bold uppercase tracking-widest text-center py-2">
                                        Melhor Custo-Benefício
                                    </div>
                                )}

                                <div className="mb-8 mt-4">
                                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                    <p className="text-slate-500 text-sm mt-2 h-10">{plan.description}</p>
                                </div>

                                <div className="mb-8">
                                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">R$ {plan.price}</span>
                                    <span className="text-slate-500 font-medium">/mês</span>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Button className={`w-full h-12 font-bold shadow-lg ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
                                    {plan.cta}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS (Corporate Style) --- */}
            <section className="py-24 bg-white border-t border-slate-200">
                <div className="container px-4 max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">O Jogo Virou</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="bg-slate-50 p-8 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={t.image} className="w-12 h-12 rounded-full object-cover grayscale" alt={t.name} />
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">{t.role}</p>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm italic leading-relaxed">
                                    {t.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-24 bg-slate-900 text-white text-center">
                <div className="container px-4 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl font-bold"> Sua Academia, Profissional.</h2>
                    <p className="text-slate-400 text-xl">Não deixe dinheiro na mesa. Comece a gerir de verdade hoje.</p>
                    <Button size="xl" className="h-16 px-10 text-xl bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-2xl shadow-blue-900/50">
                        Quero Profissionalizar
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default LandingB;
