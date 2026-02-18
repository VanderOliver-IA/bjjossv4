import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck, UserCog, Loader2, ArrowRight } from 'lucide-react';

export const DemoLoginButtons = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleDemoLogin = async (role: 'admin' | 'professor') => {
        setIsLoading(true);

        const email = role === 'admin' ? 'demo.dono@bjjoss.com' : 'demo.prof@bjjoss.com';
        const password = 'demo123456(padrao)'; // placeholder, o usuario deve criar

        try {
            // Tentativa de login real (idealmente)
            // Se falhar (pq o usuario real nao existe no auth), vamos simular o acesso com mock (se necessario)
            // Mas para o MVP vamos tentar logar de verdade, assumindo que o usuario criou a conta.

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: 'password123' // Senha padrao de desenvolvimento
            });

            if (error) throw error;

            toast.success(`Bem-vindo ao Modo Demo (${role === 'admin' ? 'Dono de CT' : 'Professor'})!`);
            navigate('/dashboard');

        } catch (error: any) {
            console.error('Demo Login Error:', error);
            // Fallback Gracioso: Se nao conseguir logar (ex: conta nao existe), 
            // avisa que precisa criar usuario de teste
            toast.error('Erro ao acessar Demo. O usuário de teste foi criado?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-black font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all hover:scale-105"
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                Ver como Dono de CT
            </Button>

            <Button
                onClick={() => handleDemoLogin('professor')}
                disabled={isLoading}
                variant="outline"
                size="lg"
                className="border-white/20 hover:bg-white/10 text-white font-semibold transition-all hover:scale-105"
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCog className="mr-2 h-5 w-5" />}
                Ver como Professor
            </Button>
        </div>
    );
};
