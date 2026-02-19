import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function TrialBanner() {
    const { profile, role } = useAuth();
    const [daysLeft, setDaysLeft] = useState<number | null>(null);
    const navigate = useNavigate();

    const isSuperAdmin = role === 'super_admin';

    useEffect(() => {
        if (isSuperAdmin) return;

        const checkTrial = async () => {
            if (!profile?.ct_id) return;

            const { data: ct } = await supabase
                .from('cts')
                .select('trial_ends_at, subscription_status')
                .eq('id', profile.ct_id)
                .single();

            if (ct?.trial_ends_at) {
                const end = new Date(ct.trial_ends_at);
                const now = new Date();
                const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                setDaysLeft(diff > 0 ? diff : 0);
            }
        };

        checkTrial();
    }, [profile?.ct_id, isSuperAdmin]);

    if (isSuperAdmin || daysLeft === null || daysLeft > 14) return null;

    return (
        <div className="bg-[#0f172a] border border-blue-500/30 p-1 rounded-[32px] mb-8 overflow-hidden shadow-2xl group transition-all hover:scale-[1.01]">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-5 rounded-[28px] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 fill-white animate-pulse" />
                            <p className="font-black text-xl italic uppercase tracking-tighter tracking-tight">Período de Experiência</p>
                        </div>
                        <p className="text-sm text-blue-100 font-medium opacity-90">
                            Aproveite mais <span className="font-black underline text-white italic">{daysLeft} dias</span> de acesso ilimitado à plataforma pro.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => navigate('/assinar')}
                        className="bg-white text-blue-600 hover:bg-slate-100 font-black italic uppercase tracking-tighter w-full md:w-auto px-8 rounded-2xl gap-3 h-14 shadow-xl active:scale-95 transition-all"
                    >
                        GARANTIR ACESSO PRO
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
