import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInDays } from 'date-fns';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function TrialBanner() {
    const { user, profile, role } = useAuth();
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    // Ocultar banner para Super Admin
    const isSuperAdmin = role === 'super_admin';

    useEffect(() => {
        if (isSuperAdmin) return;

        // Tentar usar o trial_ends_at real do CT se disponível
        const trialDate = profile?.ct?.trial_ends_at || user?.created_at;

        if (trialDate) {
            const startDate = new Date(trialDate);
            const trialEnds = profile?.ct?.trial_ends_at ? startDate : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

            const now = new Date();
            const diff = differenceInDays(trialEnds, now);

            setDaysLeft(diff > 0 ? diff : 0);
        } else {
            setDaysLeft(7);
        }
    }, [user, profile, isSuperAdmin]);

    if (isSuperAdmin || daysLeft === null || daysLeft > 10) return null;

    return (
        <div className={`w-full py-2 px-4 flex items-center justify-between text-[10px] sm:text-[11px] font-black italic tracking-tight ${daysLeft <= 3 ? 'bg-red-600' : 'bg-blue-600'} text-white shadow-xl relative z-50 uppercase`}>
            <div className="flex items-center gap-2">
                {daysLeft <= 3 ? <AlertCircle className="w-4 h-4 animate-pulse" /> : <ShieldCheck className="w-4 h-4" />}
                <span>
                    {daysLeft === 0 ? "SEU PERÍODO DE TESTE EXPIROU!" : `VOCÊ TEM ${daysLeft} ${daysLeft === 1 ? 'DIA' : 'DIAS'} DE TESTE RESTANTE${daysLeft === 1 ? '' : 'S'}.`}
                </span>
            </div>

            <Link to="/assinar">
                <Button size="sm" variant="secondary" className="h-7 text-[10px] font-black px-4 rounded-lg shadow-lg hover:scale-105 transition-transform bg-white text-black border-none">
                    {daysLeft === 0 ? "ASSINAR AGORA" : "GARANTIR ACESSO PRO"}
                </Button>
            </Link>
        </div>
    );
}
