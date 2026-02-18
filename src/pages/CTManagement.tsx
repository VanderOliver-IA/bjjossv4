import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Shield, Save, Loader2, CheckCircle2, Layout, Zap, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface CT {
    id: string;
    name: string;
    subscription: string;
    modules: any;
}

const moduleLabels: Record<string, string> = {
    alunos: 'Gestão de Alunos',
    turmas: 'Gestão de Turmas',
    presenca: 'Controle de Presença',
    crm: 'Funil de Vendas (CRM)',
    financeiro: 'Financeiro Completo',
    cantina: 'Cantina / Loja',
    eventos: 'Gestão de Eventos',
    graduacao: 'Histórico de Graduação',
    comunicacao: 'Mensageria e Mural',
    relatorios: 'Relatórios Avançados'
};

const moduleIcons: Record<string, any> = {
    alunos: Zap,
    turmas: Layout,
    presenca: Shield,
    crm: Zap,
    financeiro: Save,
    cantina: Building2,
    eventos: Layout,
    graduacao: CheckCircle2,
    comunicacao: Shield,
    relatorios: Layout
};

const CTManagement = () => {
    const { role, profile } = useAuth();
    const [cts, setCts] = useState<CT[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCt, setSelectedCt] = useState<CT | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCTs();
    }, []);

    const fetchCTs = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('cts')
                .select('id, name, subscription, modules');

            if (error) throw error;
            setCts(data || []);
        } catch (err) {
            toast.error('Erro ao carregar CTs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleModule = (moduleId: string) => {
        if (!selectedCt) return;

        const updatedModules = {
            ...selectedCt.modules,
            [moduleId]: !selectedCt.modules[moduleId]
        };

        setSelectedCt({ ...selectedCt, modules: updatedModules });
    };

    const handleSave = async () => {
        if (!selectedCt) return;
        setIsSaving(true);

        try {
            const { error } = await supabase
                .from('cts')
                .update({ modules: selectedCt.modules })
                .eq('id', selectedCt.id);

            if (error) throw error;

            // Log action to audit_logs
            await supabase.from('audit_logs').insert({
                ct_id: selectedCt.id,
                user_id: profile?.user_id,
                action: 'UPDATE',
                table_name: 'cts_modules',
                record_id: selectedCt.id,
                new_data: { modules: selectedCt.modules }
            });

            toast.success(`Configurações de ${selectedCt.name} atualizadas!`);
            fetchCTs();
        } catch (err) {
            toast.error('Erro ao salvar permissões');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredCts = cts.filter(ct => ct.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (role !== 'super_admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in duration-700">
                <div className="p-6 bg-destructive/10 rounded-[40px] border border-destructive/20 shadow-premium mb-6">
                    <Shield className="w-16 h-16 text-destructive" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white mb-2">Acesso Restrito</h2>
                <p className="text-muted-foreground text-center max-w-sm font-medium">Apenas o <span className="text-white font-bold">Diretório Global</span> pode alterar diretivas de SaaS.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="border-primary/30 text-primary font-bold bg-primary/5 uppercase tracking-tighter px-3">
                        <Building2 className="w-3 h-3 mr-1" />
                        SaaS Infrastructure
                    </Badge>
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                        Gestão de CTs
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium max-w-2xl">
                        Controle o ecossistema BjjOss. <span className="text-white/60">Ative módulos, gerencie planos e monitore o crescimento das unidades em tempo real.</span>
                    </p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-2 rounded-2xl flex items-center gap-2 shadow-premium">
                    <div className="px-6 py-2 border-r border-white/5 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unidades</p>
                        <p className="text-primary font-black text-xl leading-none">{cts.length}</p>
                    </div>
                    <div className="px-6 py-2 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Planos</p>
                        <p className="text-white font-black text-xl leading-none flex items-center gap-2">
                            4 <ChevronRight className="w-4 h-4 text-primary" />
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Lista de CTs - Premium Redesign */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar Academia..."
                            className="h-14 pl-12 bg-white/[0.02] border-white/5 rounded-2xl focus:border-primary/50 transition-all font-bold placeholder:text-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />)
                        ) : filteredCts.map(ct => (
                            <button
                                key={ct.id}
                                onClick={() => setSelectedCt(ct)}
                                className={cn(
                                    "w-full text-left p-6 rounded-[28px] border transition-all duration-500 group relative overflow-hidden",
                                    selectedCt?.id === ct.id
                                        ? "bg-primary/10 border-primary/50 shadow-neon -translate-y-1"
                                        : "bg-[#111114]/50 border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <span className={cn(
                                        "font-black text-lg tracking-tight transition-colors",
                                        selectedCt?.id === ct.id ? "text-primary" : "text-white"
                                    )}>
                                        {ct.name}
                                    </span>
                                    <Badge variant="outline" className="text-[9px] uppercase font-black border-white/10 bg-white/5 text-muted-foreground">
                                        {ct.subscription}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="flex -space-x-2">
                                        {Object.values(ct.modules || {}).filter(Boolean).slice(0, 3).map((_, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                                                <Zap className="w-3 h-3 text-primary" />
                                            </div>
                                        ))}
                                        {Object.values(ct.modules || {}).filter(Boolean).length > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold">
                                                +{Object.values(ct.modules || {}).filter(Boolean).length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ativos</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Configurações de Módulos - Premium Redesign */}
                <div className="lg:col-span-2">
                    {selectedCt ? (
                        <Card className="bg-[#111114]/40 backdrop-blur-3xl border-white/5 rounded-[40px] shadow-premium overflow-hidden animate-in zoom-in-95 duration-700">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-10">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30 shadow-neon">
                                                <Save className="w-6 h-6 text-primary" />
                                            </div>
                                            <CardTitle className="text-3xl font-black tracking-tight text-white leading-none">
                                                {selectedCt.name}
                                            </CardTitle>
                                        </div>
                                        <CardDescription className="text-lg font-medium text-muted-foreground">Diretivas de entrega do SaaS</CardDescription>
                                    </div>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-primary hover:bg-primary/90 text-black font-black rounded-2xl px-10 h-16 shadow-neon transition-all hover:scale-105 active:scale-95 text-lg"
                                    >
                                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Atualizar Unit'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(moduleLabels).map(([moduleId, label]) => {
                                        const Icon = moduleIcons[moduleId] || Layout;
                                        const active = selectedCt.modules?.[moduleId];
                                        return (
                                            <div
                                                key={moduleId}
                                                className={cn(
                                                    "flex items-center justify-between p-6 rounded-[28px] border transition-all duration-500 relative group overflow-hidden",
                                                    active
                                                        ? "bg-primary/5 border-primary/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.02)]"
                                                        : "bg-white/[0.02] border-white/5 grayscale pointer-events-none opacity-50"
                                                )}
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={cn(
                                                        "p-3 rounded-2xl border transition-all",
                                                        active ? "bg-primary/20 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"
                                                    )}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-base font-black tracking-wide text-white cursor-pointer" htmlFor={moduleId}>{label}</Label>
                                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1">
                                                            {active ? 'Premium Active' : 'Module Blocked'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    id={moduleId}
                                                    checked={active || false}
                                                    onCheckedChange={() => handleToggleModule(moduleId)}
                                                    className="data-[state=checked]:bg-primary scale-125 relative z-10"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 border-4 border-dashed border-white/5 rounded-[48px] bg-white/[0.01] animate-in fade-in duration-1000">
                            <div className="p-8 bg-white/5 rounded-[40px] border border-white/10 mb-8 opacity-20">
                                <Building2 className="w-20 h-20 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white/40 tracking-tight">Arquitetura SaaS em Espera</h3>
                            <p className="text-muted-foreground text-center mt-3 max-w-sm font-medium">Selecione uma unidade produtiva na lateral para estabelecer novas diretivas de funcionalidade.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CTManagement;
