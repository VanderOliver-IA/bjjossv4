import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Users, Smartphone, Search, MessageSquare,
    Sparkles, ArrowRight, MoreVertical, ExternalLink,
    Loader2, RefreshCw, CheckCircle, Lock, Plus,
    Rocket, Building2, Trash2, Mail, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Lead {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    academy_name: string;
    status: 'new' | 'contacted' | 'registered' | 'converted' | 'lost';
    source: string;
    demo_modules_accessed: string[];
    created_at: string;
    notes?: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
    new: { label: 'Novo Lead', class: 'bg-primary/10 text-primary border-primary/20' },
    contacted: { label: 'Em Contato', class: 'bg-belt-yellow/10 text-belt-yellow border-belt-yellow/20' },
    registered: { label: 'Trial Ativo', class: 'bg-belt-green/10 text-belt-green border-belt-green/20' },
    converted: { label: 'Assinante', class: 'bg-secondary/10 text-secondary border-secondary/20' },
    lost: { label: 'Perdido', class: 'bg-muted text-muted-foreground border-border' },
};

export default function SuperAdminLeads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [newLead, setNewLead] = useState({ name: '', email: '', whatsapp: '', academy_name: '' });
    const [actionLoading, setActionLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('saas_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Erro ao carregar leads', description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleAddLead = async () => {
        if (!newLead.name || !newLead.email || !newLead.whatsapp) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha os dados básicos.' });
            return;
        }

        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('saas_leads')
                .insert([{ ...newLead, source: 'manual', status: 'new', demo_modules_accessed: [] }]);

            if (error) throw error;
            toast({ title: 'Lead registrado.' });
            setIsAddModalOpen(false);
            setNewLead({ name: '', email: '', whatsapp: '', academy_name: '' });
            fetchLeads();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Erro', description: err.message });
        } finally {
            setActionLoading(false);
        }
    };

    const handleActivateAccount = async () => {
        if (!selectedLead) return;
        setActionLoading(true);
        try {
            const { data, error } = await supabase.rpc('activate_lead_account', {
                p_lead_id: selectedLead.id,
                p_gym_name: selectedLead.academy_name || `Academia de ${selectedLead.name.split(' ')[0]}`
            });

            if (error) throw error;
            const result = data as any;
            if (!result.success) {
                toast({ variant: 'destructive', title: 'Falha na Ativação', description: result.message });
                return;
            }

            toast({ title: '🔥 CONTA ATIVADA!', description: 'Lead transformado em Administrador (7 dias trial).' });
            setIsActivateModalOpen(false);
            fetchLeads();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Erro Crítico', description: err.message });
        } finally {
            setActionLoading(false);
        }
    };

    const updateLeadStatus = async (id: string, newStatus: Lead['status']) => {
        try {
            const { error } = await supabase
                .from('saas_leads')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
            toast({ title: 'Status atualizado' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Erro', description: err.message });
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (!confirm('Excluir este lead?')) return;
        try {
            const { error } = await supabase.from('saas_leads').delete().eq('id', id);
            if (error) throw error;
            setLeads(prev => prev.filter(l => l.id !== id));
            toast({ title: 'Removido.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Erro', description: err.message });
        }
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.whatsapp && l.whatsapp.includes(searchTerm))
    );

    return (
        <div className="space-y-8 page-fade">
            {/* Action Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pipeline <span className="text-primary">CRM</span></h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestão de leads e ativação estratégica de academias.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading} className="rounded-lg h-10 gap-2">
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Sincronizar
                    </Button>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="rounded-lg h-10 gap-2 font-bold">
                                <Plus className="w-4 h-4" /> NOVO LEAD
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm rounded-lg border-border">
                            <DialogHeader>
                                <DialogTitle className="font-bold">Novo Interessado</DialogTitle>
                                <DialogDescription className="text-xs">Cadastro manual para prospecção direta.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-1.5 uppercase text-[10px] font-bold text-muted-foreground">
                                    <Label>Nome Completo</Label>
                                    <Input value={newLead.name} onChange={e => setNewLead(prev => ({ ...prev, name: e.target.value }))} className="rounded-md h-10 text-sm" placeholder="Ex: Mestre Rickson" />
                                </div>
                                <div className="space-y-1.5 uppercase text-[10px] font-bold text-muted-foreground">
                                    <Label>WhatsApp</Label>
                                    <Input value={newLead.whatsapp} onChange={e => setNewLead(prev => ({ ...prev, whatsapp: e.target.value }))} className="rounded-md h-10 text-sm" placeholder="(11) 99999-0000" />
                                </div>
                                <div className="space-y-1.5 uppercase text-[10px] font-bold text-muted-foreground">
                                    <Label>Email</Label>
                                    <Input value={newLead.email} onChange={e => setNewLead(prev => ({ ...prev, email: e.target.value }))} className="rounded-md h-10 text-sm" placeholder="contato@ct.com" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddLead} disabled={actionLoading} className="w-full font-bold">
                                    {actionLoading ? <Loader2 className="animate-spin" /> : 'REGISTRAR'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filter */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Filtrar por nome, email ou whatsapp..."
                    className="h-12 pl-11 rounded-lg border-border bg-card shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Leads List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center animate-pulse">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Acessando Banco de Leads...</p>
                    </div>
                ) : filteredLeads.length > 0 ? filteredLeads.map(lead => (
                    <Card key={lead.id} className="sharp-card group overflow-hidden border-l-4 border-l-muted transition-all" style={{ borderLeftColor: lead.status === 'registered' || lead.status === 'converted' ? 'var(--belt-green)' : 'transparent' }}>
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center font-bold text-lg border border-border group-hover:bg-primary/5 transition-colors uppercase">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{lead.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge variant="outline" className={cn("text-[10px] border px-2 font-bold", statusConfig[lead.status].class)}>
                                                {statusConfig[lead.status].label}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {new Date(lead.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 lg:border-l lg:border-r border-border/50 lg:px-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contato</p>
                                        <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-2 text-sm font-bold hover:text-belt-green transition-colors">
                                            <Smartphone className="w-3.5 h-3.5" /> {lead.whatsapp}
                                        </a>
                                        <p className="text-[10px] text-muted-foreground truncate">{lead.email}</p>
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Última Interação</p>
                                        <p className="text-xs text-muted-foreground italic line-clamp-2 leading-relaxed">
                                            {lead.notes || 'Nenhuma observação registrada para este lead até o momento.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {lead.status !== 'registered' && lead.status !== 'converted' ? (
                                        <Button
                                            size="sm"
                                            onClick={() => { setSelectedLead(lead); setIsActivateModalOpen(true); }}
                                            className="h-10 rounded-lg gap-2 text-xs font-bold px-4"
                                        >
                                            <Rocket className="w-4 h-4" /> ATIVAR TRIAL
                                        </Button>
                                    ) : (
                                        <Badge className="bg-belt-green/5 text-belt-green border-belt-green/20 py-2 px-4 rounded-lg font-bold text-xs">
                                            <CheckCircle className="w-3.5 h-3.5 mr-2" /> CLIENTE ATIVO
                                        </Badge>
                                    )}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 border border-border rounded-lg">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-card border-border p-1 rounded-lg shadow-xl">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase p-2 tracking-widest border-b border-border mb-1">Status</p>
                                            <DropdownMenuItem className="p-2 text-xs font-bold rounded-md cursor-pointer" onClick={() => updateLeadStatus(lead.id, 'contacted')}>
                                                <MessageSquare className="w-3.5 h-3.5 mr-3 text-belt-yellow" /> Marcar em Contato
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="p-2 text-xs font-bold rounded-md cursor-pointer" onClick={() => updateLeadStatus(lead.id, 'converted')}>
                                                <Rocket className="w-3.5 h-3.5 mr-3 text-secondary" /> Assinante (Painel Full)
                                            </DropdownMenuItem>
                                            <div className="h-px bg-border my-1" />
                                            <DropdownMenuItem className="p-2 text-xs font-bold rounded-md cursor-pointer text-destructive" onClick={() => handleDeleteLead(lead.id)}>
                                                <Trash2 className="w-3.5 h-3.5 mr-3" /> Excluir Lead
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="py-20 text-center border border-dashed rounded-lg border-border">
                        <Users className="w-8 h-8 mx-auto mb-4 text-muted-foreground opacity-30" />
                        <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest">Nenhum lead encontrado.</p>
                    </div>
                )}
            </div>

            {/* Activation Modal */}
            <Dialog open={isActivateModalOpen} onOpenChange={setIsActivateModalOpen}>
                <DialogContent className="max-w-sm rounded-lg border-border">
                    <DialogHeader className="items-center text-center">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
                            <Rocket className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="font-bold">Liberar Acesso CT</DialogTitle>
                        <DialogDescription className="text-xs">
                            {selectedLead ? `Converter ${selectedLead.name} para Administrador?` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-2">
                        <div className="bg-muted p-3 rounded-md text-[10px] font-medium leading-relaxed">
                            Criação automática de conta e trial de 7 dias com todos os módulos liberados.
                        </div>
                    </div>
                    <DialogFooter className="flex-col gap-2">
                        <Button onClick={handleActivateAccount} disabled={actionLoading} className="w-full font-bold h-12 gap-2">
                            {actionLoading ? <Loader2 className="animate-spin" /> : <>CONVOCAR PARA TRIAL <ArrowRight className="w-4 h-4" /></>}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsActivateModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Voltar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
