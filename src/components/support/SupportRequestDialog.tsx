import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, ShieldCheck, Loader2 } from "lucide-react";

export function SupportRequestDialog() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState<string[]>(['alunos', 'crm']);

    const togglePermission = (id: string) => {
        setPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleRequestSupport = async () => {
        setLoading(true);
        try {
            // 1. Buscar CT ID do usuário
            const { data: profile } = await supabase
                .from('profiles')
                .select('ct_id')
                .eq('user_id', user?.id)
                .single();

            if (!profile?.ct_id) throw new Error("CT não encontrado.");

            // 2. Criar registro de acesso (Válido por 24h)
            const { error } = await supabase
                .from('support_access_requests')
                .insert({
                    ct_id: profile.ct_id,
                    granted_by: user?.id,
                    permissions: permissions,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                });

            if (error) throw error;

            toast({
                title: "Suporte Solicitado!",
                description: "O administrador global agora tem acesso temporário (24h) às áreas selecionadas.",
            });
            setOpen(false);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao solicitar suporte",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 gap-2">
                    <LifeBuoy className="w-4 h-4" />
                    Pedir Suporte Técnico
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f172a] border-slate-800 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="text-blue-500" />
                        Autorizar Acesso ao Suporte
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 pt-2">
                        Em conformidade com a LGPD, você decide quais módulos o suporte da BjjOss poderá visualizar para te ajudar. Este acesso expira automaticamente em 24 horas.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-xs font-bold text-slate-500 uppercase">Selecione os módulos liberados:</p>

                    <div className="grid gap-4">
                        {[
                            { id: 'alunos', label: 'Dados dos Alunos' },
                            { id: 'financeiro', label: 'Fluxo de Caixa e faturas' },
                            { id: 'cantina', label: 'Estoque e Vendas Cantina' },
                            { id: 'crm', label: 'Leads e Matrículas' },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                <Checkbox
                                    id={item.id}
                                    checked={permissions.includes(item.id)}
                                    onCheckedChange={() => togglePermission(item.id)}
                                />
                                <Label htmlFor={item.id} className="cursor-pointer text-sm font-medium">{item.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleRequestSupport}
                    disabled={loading || permissions.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 h-12 font-bold"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Confirmar Liberação Temporária"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
