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
        <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] font-sans selection:bg-orange-500/30">
            {/* --- HERO SECTION (Social Dark) --- */}
            <section className="relative pt-32 pb-24 overflow-hidden rounded-b-[3rem] shadow-2xl border-b-4 border-orange-600 bg-[#292524]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />

                <div className="container px-4 text-center max-w-4xl mx-auto space-y-8 relative z-10">
                    <div className="inline-block px-6 py-2 bg-orange-600 text-white rounded-full font-bold text-lg rotate-[-2deg] shadow-lg transform hover:rotate-2 transition-transform cursor-default border border-orange-400">
                        👋 Bem-vindo à Família!
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none drop-shadow-xl">
                        Mais que um sistema. <br />
                        <span className="text-orange-500 underline decoration-wavy decoration-orange-700">Uma Tribo.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-stone-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Junte-se a professores que amam o tatame e odeiam burocracia. Cuide dos seus alunos, nós cuidamos da papelada.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                        <Button onClick={scrollToPlans} size="xl" className="bg-orange-600 hover:bg-orange-500 text-white font-bold h-16 px-10 rounded-2xl text-xl shadow-[0_10px_0_rgb(154,52,18)] hover:shadow-[0_5px_0_rgb(154,52,18)] hover:translate-y-[5px] transition-all border-b-4 border-orange-800">
                            Quero Fazer Parte
                            <Heart className="ml-2 w-6 h-6 fill-white animate-pulse" />
                        </Button>
                    </div>

                    {/* Photo Grid Dark */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 px-4 rotate-1 hover:rotate-0 transition-transform duration-700 opacity-80 hover:opacity-100">
                        <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop" className="rounded-2xl shadow-lg hover:scale-105 transition-transform object-cover h-48 w-full border-2 border-stone-700" />
                        <img src="https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2670&auto=format&fit=crop" className="rounded-2xl shadow-lg hover:scale-105 transition-transform object-cover h-48 w-full mt-8 md:mt-0 border-2 border-stone-700" />
                        <img src="https://images.unsplash.com/photo-1583476346985-7096e1ec82c4?q=80&w=2574&auto=format&fit=crop" className="rounded-2xl shadow-lg hover:scale-105 transition-transform object-cover h-48 w-full border-2 border-stone-700" />
                        <img src="https://images.unsplash.com/photo-1620026210207-e03445e9a4f6?q=80&w=2669&auto=format&fit=crop" className="rounded-2xl shadow-lg hover:scale-105 transition-transform object-cover h-48 w-full mt-8 md:mt-0 border-2 border-stone-700" />
                    </div>
                </div>
            </section>

            {/* --- COMMUNITY PROOF DARK --- */}
            <section className="py-24 bg-[#1c1917]">
                <div className="container px-4 text-center">
                    <h2 className="text-3xl font-black mb-16 flex items-center justify-center gap-3 text-white">
                        <Users className="w-8 h-8 text-orange-500" />
                        Quem tá usando?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="bg-[#292524] p-8 rounded-[2rem] shadow-xl border-b-8 border-orange-900 relative group hover:-translate-y-2 transition-transform">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-[#1c1917] shadow-md overflow-hidden">
                                    <img src={t.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                </div>
                                <div className="mt-8">
                                    <div className="flex justify-center text-yellow-500 mb-4">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-current" />)}
                                    </div>
                                    <p className="text-lg font-medium text-stone-300 italic mb-6">"{t.text}"</p>
                                    <p className="font-bold text-white">{t.name}</p>
                                    <p className="text-sm text-stone-500 font-bold uppercase tracking-wide">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- DEMO ACCESSIBLE DARK --- */}
            <section className="py-24 bg-[#0c0a09] border-y-4 border-orange-900/30 border-dashed">
                <div className="container px-4 flex flex-col items-center">
                    <div className="bg-[#1c1917] p-12 rounded-[3rem] shadow-[0_20px_40px_-10px_rgba(234,88,12,0.1)] max-w-4xl w-full text-center border border-stone-800">
                        <h2 className="text-4xl font-black text-rose-500 mb-6">Sem Compromisso Mesma!</h2>
                        <p className="text-xl text-stone-400 mb-10 max-w-xl mx-auto">
                            Dê uma espiadinha no sistema agora. Criamos uma "Academia Fantasma" só pra você brincar.
                        </p>

                        <div className="p-4 bg-orange-900/10 rounded-3xl inline-block border border-orange-900/20">
                            <DemoLoginButtons />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING DARK (Card Style) --- */}
            <section ref={plansSectionRef} className="py-24 bg-[#1c1917]" id="pricing">
                <div className="container px-4">
                    <h2 className="text-4xl font-black text-center mb-16 text-white">Quanto Custa Participar?</h2>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {PLANS.map((plan) => (
                            <div key={plan.id} className={`bg-[#292524] rounded-[2.5rem] p-8 relative flex flex-col ${plan.highlight ? 'border-4 border-orange-600 shadow-[0_20px_40px_-10px_rgba(234,88,12,0.2)] scale-105 z-10' : 'border border-stone-800 shadow-lg hover:shadow-xl hover:border-stone-700'}`}>
                                {plan.highlight && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-rose-600 text-white font-bold px-6 py-2 rounded-full shadow-md rotate-[-2deg] border border-rose-800">
                                        🔥 O Preferido da Galera
                                    </div>
                                )}

                                <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                                <p className="text-stone-500 text-sm mb-6 font-medium">{plan.description}</p>

                                <div className="text-5xl font-black text-orange-500 mb-8 tracking-tighter">
                                    R$ {plan.price}
                                    <span className="text-base text-stone-600 font-bold ml-1 align-middle">/mês</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-stone-400 font-bold text-sm">
                                            <div className="w-6 h-6 rounded-full bg-green-900/20 flex items-center justify-center flex-shrink-0">
                                                <Smile className="w-4 h-4 text-green-500" />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Button className={`w-full h-14 rounded-2xl text-lg font-black shadow-lg hover:shadow-md hover:translate-y-[2px] transition-all ${plan.highlight ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'}`}>
                                    {plan.cta}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FAQ & Final CTA --- */}
            <section className="py-24 bg-[#0c0a09] border-t border-stone-800">
                <div className="container px-4 max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-black mb-12 text-white">BjjOss é pra mim?</h2>

                    <Accordion type="single" collapsible className="w-full text-left bg-[#1c1917] rounded-3xl p-6 border border-stone-800 mb-16">
                        {FAQ.map((item, idx) => (
                            <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-stone-700 px-2 last:border-0 hover:bg-white/5 rounded-xl transition-colors">
                                <AccordionTrigger className="text-lg font-bold text-stone-300 py-6 hover:no-underline hover:text-orange-500 transition-colors">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-stone-500 font-medium pb-6 text-base leading-relaxed">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <div className="bg-rose-600 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform border-4 border-rose-800">
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-4xl font-black">Vamos crescer juntos?</h2>
                            <p className="text-xl opacity-90 font-medium text-rose-100">Você foca no treino. A gente cuida do resto.</p>
                            <Button size="xl" className="h-16 px-10 bg-white text-rose-600 font-black rounded-2xl text-xl hover:bg-rose-50 shadow-lg border-b-4 border-rose-200">
                                Acesso Vitalício
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingC;
