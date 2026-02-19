import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';

export default function WhatsAppVerification() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const whatsapp = searchParams.get('whatsapp') || '';
    const navigate = useNavigate();
    const { toast } = useToast();

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [verified, setVerified] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Send code on mount
    useEffect(() => {
        if (email && whatsapp) {
            sendCode();
        }
    }, []);

    const sendCode = async () => {
        setResending(true);
        try {
            const { data, error } = await supabase.rpc('generate_whatsapp_code', {
                p_email: email,
                p_whatsapp: whatsapp,
            });

            if (error) throw error;

            const result = data as any;

            if (!result.success) {
                toast({ variant: 'destructive', title: 'Erro', description: result.message });
                return;
            }

            // Enviar código para N8N webhook
            try {
                const { data: configData } = await supabase
                    .from('saas_config')
                    .select('value')
                    .eq('key', 'n8n_whatsapp_webhook_url')
                    .single();

                if (configData?.value && !configData.value.includes('SEU_N8N')) {
                    await fetch(configData.value, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            whatsapp: whatsapp,
                            code: result.code,
                            message: `🥋 BjjOss - Seu código de verificação: *${result.code}*\n\nVálido por ${result.expires_in_minutes} minutos.`,
                        }),
                    });
                } else {
                    // N8N não configurado: mostra código no toast (apenas dev)
                    console.warn('[DEV] N8N não configurado. Código:', result.code);
                    toast({
                        title: '🔧 Modo Desenvolvimento',
                        description: `Código: ${result.code} (N8N não configurado)`,
                    });
                }
            } catch (webhookErr) {
                console.warn('[DEV] Erro ao chamar webhook N8N:', webhookErr);
                toast({
                    title: '🔧 Webhook N8N indisponível',
                    description: `Use o código mostrado no console do banco.`,
                });
            }

            setCountdown(60);
            toast({ title: '✅ Código enviado!', description: `Verifique seu WhatsApp: ${whatsapp}` });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Erro', description: err.message });
        } finally {
            setResending(false);
        }
    };

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (newCode.every(d => d !== '') && newCode.join('').length === 6) {
            verifyCode(newCode.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...code];
        pasted.split('').forEach((char, i) => { newCode[i] = char; });
        setCode(newCode);
        if (pasted.length === 6) verifyCode(pasted);
    };

    const verifyCode = async (fullCode: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('verify_whatsapp_code', {
                p_email: email,
                p_code: fullCode,
            });

            if (error) throw error;

            const result = data as any;

            if (!result.success) {
                toast({ variant: 'destructive', title: 'Código inválido', description: result.message });
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                return;
            }

            setVerified(true);
            toast({ title: '✅ WhatsApp verificado!', description: 'Sua conta está ativa.' });

            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Erro', description: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (verified) {
        return (
            <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center">
                <div className="text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black">WhatsApp Verificado!</h1>
                    <p className="text-slate-400">Redirecionando para o login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-3xl flex items-center justify-center border border-green-500/20">
                        <Smartphone className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black">Confirme seu WhatsApp</h1>
                    <p className="text-slate-400">
                        Enviamos um código de 6 dígitos para
                    </p>
                    <p className="text-white font-bold text-lg">{whatsapp}</p>
                </div>

                {/* Code Input */}
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <Input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-14 h-16 text-center text-2xl font-black bg-[#0f172a] border-slate-700 focus:border-green-500 rounded-2xl"
                            disabled={loading}
                        />
                    ))}
                </div>

                {/* Loading indicator */}
                {loading && (
                    <div className="flex items-center justify-center gap-2 text-blue-400">
                        <Loader2 className="animate-spin w-5 h-5" />
                        <span className="text-sm font-bold">Verificando...</span>
                    </div>
                )}

                {/* Resend */}
                <div className="text-center space-y-3">
                    <p className="text-xs text-slate-500">Não recebeu o código?</p>
                    <Button
                        variant="ghost"
                        onClick={sendCode}
                        disabled={countdown > 0 || resending}
                        className="text-blue-400 hover:text-blue-300 gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                        {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
                    </Button>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] text-slate-600">
                    O código expira em 10 minutos. Máximo de 5 tentativas.
                </p>
            </div>
        </div>
    );
}
