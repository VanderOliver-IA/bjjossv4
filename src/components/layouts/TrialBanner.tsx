import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInDays, differenceInHours } from 'date-fns';
import { AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function TrialBanner() {
    const { user } = useAuth();
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        // Simulação: Pegar do profile.trial_ends_at quando backend estiver pronto.
        // Por enquanto, dummy trial logic baseada na data de criação (ou mock).
        if (user?.created_at) {
            const createdAt = new Date(user.created_at);
            const trialEnds = new Date(createdAt);
            trialEnds.setDate(trialEnds.getDate() + 7);

            const now = new Date();
            const diff = differenceInDays(trialEnds, now);

            // Se diff < 0, trial acabou.
            setDaysLeft(diff > 0 ? diff : 0);
        } else {
            // Se for usuário demo antigo, mostra 7 dias fake sempre
            setDaysLeft(7);
        }
    }, [user]);

    if (daysLeft === null || daysLeft > 7) return null; // Não mostra se não calculou ou se é plano pago (>7 dias de margem?)

    return (
        <div className={`w-full py-2 px-4 flex items-center justify-between text-xs sm:text-sm font-medium ${daysLeft <= 3 ? 'bg-red-600' : 'bg-blue-600'} text-white shadow-lg relative z-50`}>
            <div className="flex items-center gap-2">
                {daysLeft <= 3 ? <AlertCircle className="w-4 h-4 animate-pulse" /> : <ShieldCheck className="w-4 h-4" />}
                <span>
                    {daysLeft === 0 ? "SEU PERÍODO DE TESTE EXPIROU!" : `VOCÊ TEM ${daysLeft} DIAS DE TESTE GRÁTIS RESTANTES.`}
                </span>
            </div>

            <Link to="/pagamento">
                <Button size="sm" variant="secondary" className="h-7 text-xs font-bold px-3">
                    {daysLeft === 0 ? "ASSINAR AGORA" : "GARANTIR ACESSO PRO"}
                </Button>
            </Link>
        </div>
    );
}
