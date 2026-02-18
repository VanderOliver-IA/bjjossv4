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
import { ArrowRight, Heart, Users, MessagesSquare, Smile, Star, MapPin, Share2 } from 'lucide-react';
import { DemoLoginButtons } from '@/components/landing/DemoLoginButtons';

const LandingC = () => {
    const plansSectionRef = useRef<HTMLDivElement>(null);

    const scrollToPlans = () => {
        plansSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#FFFBF5] text-[#2D241E] font-sans selection:bg-orange-200">
            {/* --- HERO SECTION (Social / Community) --- */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-white rounded-b-[4rem] shadow-xl border-b-4 border-orange-400">
                <div className="container px-4 text-center max-w-4xl mx-auto space-y-8">
                    <div className="inline-block px-6 py-2 bg-orange-100 text-orange-600 rounded-full font-handwritten text-xl rotate-[-2deg] shadow-sm transform hover:rotate-2 transition-transform cursor-default">
                        👋 Bem-vindo à Família BjjOss!
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-[#2D241E] tracking-tight leading-none">
                        Mais que um sistema. <br />
                        <span className="text-orange-500 highlight font-marker underline decoration-wavy decoration-orange-300">Uma Tribo.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-stone-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Junte-se a professores que amam o tatame e odeiam burocracia. Cuide dos seus alunos, nós cuidamos da papelada.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                        <Button onClick={scrollToPlans} size="xl" className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-16 px-10 rounded-2xl text-xl shadow-[0_10px_0_rgb(194,65,12)] hover:shadow-[0_5px_0_rgb(194,65,12)] hover:translate-y-[5px] transition-all">
                            Quero Fazer Parte
                            <Heart className="ml-2 w-6 h-6 fill-white animate-pulse" />
                        </Button>
                    </div>

                    {/* Photo Grid Hero */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 px-4 rotate-1 hover:rotate-0 transition-transform duration-700">
                        <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop" className="rounded-2xl shadow-lg hover:scale-105 transition-transform object-cover h-48 w-full" />
                        <img src="https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2670&auto=format&fit=crop" className="rounded-2xl shadow-lg hover:scale-105 transition-transform object-cover h-48 w-full mt-8 md:mt-0" />
                        <img src="https://images.unsplash.com/photo-1583476346985-7096e1ec82c4?q=80&w=2574&auto=format&fit=crop" className="rounded-2xl shadow-lg hover:scale-105 transition-transform object-cover h-48 w-full" />
                        <img src="https://images.unsplash.com/photo-1620026210207-e03445e9a4f6?q=80&w=2669&auto=format&fit=crop" className="rounded-2xl shadow-lg hover:scale-105 transition-transform object-cover h-48 w-full mt-8 md:mt-0" />
                    </div>
                </div>
            </section>

            {/* --- COMMUNITY PROOF --- */}
            <section className="py-24 bg-[#FFFBF5]">
                <div className="container px-4 text-center">
                    <h2 className="text-3xl font-black mb-16 flex items-center justify-center gap-3">
                        <Users className="w-8 h-8 text-orange-500" />
                        Quem tá usando?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2rem] shadow-xl border-b-8 border-orange-100 relative group hover:-translate-y-2 transition-transform">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden">
                                    <img src={t.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="mt-8">
                                    <div className="flex justify-center text-yellow-400 mb-4">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-current" />)}
                                    </div>
                                    <p className="text-lg font-medium text-stone-700 italic mb-6">"{t.text}"</p>
                                    <p className="font-bold text-stone-900">{t.name}</p>
                                    <p className="text-sm text-stone-400 font-bold uppercase tracking-wide">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- DEMO ACCESSIBLE --- */}
            <section className="py-24 bg-orange-50 border-y-4 border-orange-200 border-dashed">
                <div className="container px-4 flex flex-col items-center">
                    <div className="bg-white p-12 rounded-[3rem] shadow-[0_20px_40px_-10px_rgba(251,146,60,0.2)] max-w-4xl w-full text-center">
                        <h2 className="text-4xl font-black text-rose-500 mb-6">Sem Compromisso, Mesmo!</h2>
                        <p className="text-xl text-stone-600 mb-10 max-w-xl mx-auto">
                            Dê uma espiadinha no sistema agora. Criamos uma "Academia Fantasma" só pra você brincar.
                        </p>

                        <div className="p-2 bg-orange-100/50 rounded-2xl inline-block">
                            <DemoLoginButtons />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING (Card Style) --- */}
            <section ref={plansSectionRef} className="py-24 bg-[#FFFBF5]" id="pricing">
                <div className="container px-4">
                    <h2 className="text-4xl font-black text-center mb-16 text-[#2D241E]">Quanto Custa Participar?</h2>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {PLANS.map((plan) => (
                            <div key={plan.id} className={`bg-white rounded-[2.5rem] p-8 relative flex flex-col ${plan.highlight ? 'border-4 border-orange-400 shadow-[0_20px_40px_-10px_rgba(251,146,60,0.3)] scale-105 z-10' : 'border border-stone-100 shadow-lg hover:shadow-xl'}`}>
                                {plan.highlight && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-rose-500 text-white font-bold px-6 py-2 rounded-full shadow-md rotate-[-2deg]">
                                        🔥 O Preferido da Galera
                                    </div>
                                )}

                                <h3 className="text-2xl font-black text-stone-800 mb-2">{plan.name}</h3>
                                <p className="text-stone-500 text-sm mb-6 font-medium">{plan.description}</p>

                                <div className="text-5xl font-black text-orange-500 mb-8 tracking-tighter">
                                    R$ {plan.price}
                                    <span className="text-base text-stone-400 font-bold ml-1 align-middle">/mês</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-stone-600 font-bold text-sm">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <Smile className="w-4 h-4 text-green-600" />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Button className={`w-full h-14 rounded-2xl text-lg font-black shadow-lg hover:shadow-md hover:translate-y-[2px] transition-all ${plan.highlight ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'}`}>
                                    {plan.cta}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FAQ & Final CTA --- */}
            <section className="py-24 bg-white rounded-t-[4rem] shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
                <div className="container px-4 max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-black mb-12">BjjOss é pra mim?</h2>

                    <Accordion type="single" collapsible className="w-full text-left bg-stone-50 rounded-3xl p-6 border border-stone-100 mb-16">
                        {FAQ.map((item, idx) => (
                            <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-stone-200 px-2 last:border-0 hover:bg-orange-50/50 rounded-xl transition-colors">
                                <AccordionTrigger className="text-lg font-bold text-stone-700 py-6 hover:no-underline">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-stone-500 font-medium pb-6 text-base leading-relaxed">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <div className="bg-rose-500 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-4xl font-black">Vamos crescer juntos?</h2>
                            <p className="text-xl opacity-90 font-medium">Você foca no treino. A gente cuida do resto.</p>
                            <Button size="xl" className="h-16 px-10 bg-white text-rose-600 font-black rounded-2xl text-xl hover:bg-rose-50 shadow-lg">
                                Criar Conta Agora
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingC;
