import React, { useEffect, useState } from 'react';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, Save, Loader2, UserCircle, Building2, ChevronRight, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

const ManagePermissions = () => {
    const { profile, role: userRole } = useAuth();
    const [selectedRole, setSelectedRole] = useState<AppRole>('professor');
    const [permissions, setPermissions] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // SuperAdmin specifics
    const [cts, setCts] = useState<{ id: string, name: string }[]>([]);
    const [selectedCtId, setSelectedCtId] = useState<string | null>(null);

    const roles: { label: string; value: AppRole }[] = [
        { label: 'Professor', value: 'professor' },
        { label: 'Atendente', value: 'atendente' },
        { label: 'Aluno', value: 'aluno' },
    ];

    useEffect(() => {
        if (userRole === 'super_admin') {
            fetchCTs();
        } else if (profile?.ct_id) {
            setSelectedCtId(profile.ct_id);
        }
    }, [userRole, profile?.ct_id]);

    useEffect(() => {
        if (selectedCtId) {
            fetchPermissions();
        }
    }, [selectedRole, selectedCtId]);

    const fetchCTs = async () => {
        const { data, error } = await supabase.from('cts').select('id, name');
        if (data) setCts(data);
        if (data && data.length > 0 && !selectedCtId) {
            setSelectedCtId(data[0].id);
        }
    };

    const fetchPermissions = async () => {
        if (!selectedCtId) return;
        setIsLoading(true);
        const { data, error } = await supabase
            .from('role_permissions')
            .select('modules')
            .eq('ct_id', selectedCtId)
            .eq('role', selectedRole)
            .maybeSingle();

        if (error) {
            toast.error('Erro ao carregar permissões');
        } else if (data) {
            setPermissions(data.modules);
        } else {
            setPermissions({});
        }
        setIsLoading(false);
    };

    const handleToggleModule = (moduleId: string) => {
        setPermissions({
            ...permissions,
            [moduleId]: !permissions[moduleId]
        });
    };

    const handleSave = async () => {
        if (!selectedCtId) return;
        setIsSaving(true);

        const { error } = await supabase
            .from('role_permissions')
            .upsert({
                ct_id: selectedCtId,
                role: selectedRole,
                modules: permissions
            }, { onConflict: 'ct_id, role' });

        if (error) {
            toast.error('Erro ao salvar permissões');
        } else {
            toast.success(`Permissões do perfil ${selectedRole} atualizadas!`);
        }
        setIsSaving(false);
    };

    if (userRole !== 'admin_ct' && userRole !== 'super_admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
                <div className="p-6 bg-destructive/10 rounded-full mb-6">
                    <Shield className="w-16 h-16 text-destructive" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-white">Acesso Restrito</h2>
                <p className="text-muted-foreground mt-2 max-w-xs text-center">Apenas Administradores do sistema podem gerenciar permissões de acesso.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header com Estética Premium */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-primary/30 text-primary font-bold bg-primary/5 uppercase tracking-tighter px-3">
                            <Shield className="w-3 h-3 mr-1" />
                            Security Manager
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                        Controle de Acessos
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl">
                        Gerencie as permissões granulares dos perfis do sistema. <span className="text-white/80">Configure quem pode visualizar cada módulo do CT.</span>
                    </p>
                </div>

                {userRole === 'super_admin' && (
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 rounded-3xl flex items-center gap-4 shadow-premium min-w-[300px]">
                        <div className="p-3 bg-secondary/20 rounded-2xl">
                            <Building2 className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Selecionar Unidade</Label>
                            <Select value={selectedCtId || ""} onValueChange={setSelectedCtId}>
                                <SelectTrigger className="bg-transparent border-none text-white font-bold h-8 p-0 focus:ring-0">
                                    <SelectValue placeholder="Selecione um CT" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111114] border-white/10 rounded-2xl overflow-hidden">
                                    {cts.map(ct => (
                                        <SelectItem key={ct.id} value={ct.id} className="text-white hover:bg-white/5 transition-colors font-medium py-3">
                                            {ct.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Seleção de Perfil - Estilo Cartões Modernos */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Níveis de Usuário</h3>
                    </div>
                    <div className="space-y-3">
                        {roles.map(r => (
                            <button
                                key={r.value}
                                onClick={() => setSelectedRole(r.value)}
                                className={cn(
                                    "group relative w-full text-left p-5 rounded-3xl border transition-all duration-500 overflow-hidden",
                                    selectedRole === r.value
                                        ? "bg-primary/10 border-primary/40 shadow-premium"
                                        : "bg-[#111114]/50 border-white/5 hover:border-white/10"
                                )}
                            >
                                {selectedRole === r.value && (
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    </div>
                                )}
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn(
                                        "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110",
                                        selectedRole === r.value ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
                                    )}>
                                        <UserCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="block font-black text-lg text-white tracking-tight">{r.label}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Acesso customizado</span>
                                    </div>
                                </div>
                                {selectedRole === r.value && (
                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-transparent" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="bg-gradient-to-br from-secondary/10 to-transparent border border-white/5 p-6 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary/20 rounded-lg">
                                <Globe className="w-4 h-4 text-secondary" />
                            </div>
                            <span className="text-xs font-bold text-white uppercase">Hierarchy View</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Alterações feitas aqui afetarão todos os perfis do tipo <span className="text-white font-bold uppercase">{selectedRole}</span> nesta unidade.
                        </p>
                    </div>
                </div>

                {/* Módulos de Permissão - Layout Premium */}
                <div className="lg:col-span-3">
                    <Card className="bg-[#111114]/40 backdrop-blur-xl border-white/5 rounded-[40px] shadow-premium-hover border-t-white/10 overflow-hidden">
                        <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <div>
                                    <CardTitle className="text-3xl font-black flex items-center gap-3 tracking-tighter">
                                        Features do Plano: <span className="text-primary italic">{roles.find(r => r.value === selectedRole)?.label}</span>
                                    </CardTitle>
                                    <CardDescription className="text-lg font-medium mt-1">Habilite ou desabilite o poder deste usuário no CT.</CardDescription>
                                </div>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || isLoading}
                                    className="bg-white text-black hover:bg-white/90 font-black rounded-2xl px-10 h-14 text-md shadow-premium transition-all hover:-translate-y-1 active:scale-95 group"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                                            Confirmar Alterações
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>
                                    <p className="font-black text-muted-foreground uppercase tracking-[0.3em] text-xs">Carregando Matrix de Permissões</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(moduleLabels).map(([moduleId, label]) => (
                                        <div
                                            key={moduleId}
                                            onClick={() => handleToggleModule(moduleId)}
                                            className={cn(
                                                "group flex items-center justify-between p-7 rounded-[32px] border transition-all duration-500 cursor-pointer",
                                                permissions?.[moduleId]
                                                    ? "bg-primary/5 border-primary/30 shadow-neon"
                                                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                    permissions?.[moduleId] ? "bg-primary/20 text-primary scale-110 shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground"
                                                )}>
                                                    <ChevronRight className={cn("w-5 h-5 transition-transform", permissions?.[moduleId] && "rotate-90")} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-lg font-black tracking-tight text-white cursor-pointer block">{label}</Label>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Módulo {permissions?.[moduleId] ? 'Ativado' : 'Bloqueado'}</span>
                                                </div>
                                            </div>
                                            <Switch
                                                id={moduleId}
                                                checked={permissions?.[moduleId] || false}
                                                onCheckedChange={() => handleToggleModule(moduleId)}
                                                className="data-[state=checked]:bg-primary h-7 w-12"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ManagePermissions;
