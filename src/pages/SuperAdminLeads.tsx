import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Users,
    Smartphone,
    Mail,
    Calendar,
    Search,
    MessageSquare,
    Clock,
    Sparkles,
    ArrowRight,
    Filter,
    MoreVertical,
    ExternalLink,
    Loader2,
    RefreshCw,
    CheckCircle,
    Lock,
    Plus,
    Rocket,
    Building2,
    Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';

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
}

const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    registered: 'bg-green-500/10 text-green-400 border-green-500/20',
    converted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    lost: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const statusLabels: Record<string, string> = {
    new: 'Novo Lead',
    contacted: 'Em Contato',
    registered: 'Cadastrado',
    converted: 'Convertido',
    lost: 'Perdido',
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
            toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha os dados básicos do lead.' });
            return;
        }

        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('saas_leads')
                .insert([{
                    ...newLead,
                    source: 'manual',
                    status: 'new',
                    demo_modules_accessed: []
                }]);

            if (error) throw error;

            toast({ title: '✅ Lead Adicionado', description: 'Interessado registrado com sucesso.' });
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
                toast({ variant: 'destructive', title: '❌ Falha na Ativação', description: result.message });
                return;
            }

            toast({ title: '🔥 CONTA ATIVADA!', description: 'O lead agora é um Administrador de CT com 7 dias de trial.' });
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
            toast({ title: 'Status atualizado', description: `Lead movido para ${statusLabels[newStatus]}` });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Erro', description: err.message });
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este lead?')) return;

        try {
            const { error } = await supabase.from('saas_leads').delete().eq('id', id);
            if (error) throw error;
            setLeads(prev => prev.filter(l => l.id !== id));
            toast({ title: 'Lead removido' });
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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header com Botões de Ação */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 font-bold bg-blue-500/5 uppercase tracking-tighter px-3 mb-2">
                        <Sparkles className="w-3 h-3 mr-1 fill-blue-500" />
                        Vendas & Conversão
                    </Badge>
                    <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white shadow-sm">CRM BjjOss <span className="text-blue-600">Pro</span></h1>
                    <p className="text-muted-foreground font-medium">Gestão centralizada de oportunidades e ativação de clientes</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-500 h-12 rounded-2xl font-black italic gap-2 px-6 shadow-xl shadow-blue-500/20">
                                <Plus className="w-5 h-5" />
                                NOVO LEAD
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0f172a] border-slate-800 text-white rounded-[32px]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase italic">Adicionar Novo Interessado</DialogTitle>
                                <DialogDescription className="text-slate-500">Insira manualmente um lead para acompanhamento.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4 uppercase font-bold text-[10px] tracking-widest text-slate-400">
                                <div className="space-y-2">
                                    <Label>Nome Completo</Label>
                                    <Input value={newLead.name} onChange={e => setNewLead(prev => ({ ...prev, name: e.target.value }))} className="bg-[#1e293b] border-slate-800 h-12 rounded-xl" placeholder="Nome do Dono/Professor" />
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp</Label>
                                    <Input value={newLead.whatsapp} onChange={e => setNewLead(prev => ({ ...prev, whatsapp: e.target.value }))} className="bg-[#1e293b] border-slate-800 h-12 rounded-xl" placeholder="(00) 00000-0000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={newLead.email} onChange={e => setNewLead(prev => ({ ...prev, email: e.target.value }))} className="bg-[#1e293b] border-slate-800 h-12 rounded-xl" placeholder="email@exemplo.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Academia (Opcional)</Label>
                                    <Input value={newLead.academy_name} onChange={e => setNewLead(prev => ({ ...prev, academy_name: e.target.value }))} className="bg-[#1e293b] border-slate-800 h-12 rounded-xl" placeholder="Nome da Academia" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddLead} disabled={actionLoading} className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black italic text-lg shadow-xl shadow-blue-500/20">
                                    {actionLoading ? <Loader2 className="animate-spin" /> : 'CONFIRMAR CADASTRO'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="bg-[#0f172a] border-slate-800 h-12 rounded-2xl px-6 font-bold gap-2" onClick={fetchLeads} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        ATUALIZAR
                    </Button>
                </div>
            </div>

            {/* Stats e Filtro */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-[#0f172a] border-slate-800 rounded-[32px] overflow-hidden relative shadow-2xl transition-all hover:border-blue-500/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-8 -mt-8" />
                    <CardContent className="pt-8">
                        <p className="text-4xl font-black tracking-tighter italic">{leads.length}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Leads</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#0f172a] border-slate-800 rounded-[32px] overflow-hidden relative shadow-2xl transition-all hover:border-green-500/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-3xl -mr-8 -mt-8" />
                    <CardContent className="pt-8">
                        <p className="text-4xl font-black tracking-tighter italic text-green-500">
                            {leads.filter(l => l.status === 'registered').length}
                        </p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Convertidos</p>
                    </CardContent>
                </Card>
            </div>

            <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all rounded-3xl" />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                    placeholder="Filtrar por nome, email, whatsapp ou academia..."
                    className="bg-[#0f172a]/80 backdrop-blur-xl border-slate-800 h-16 pl-14 rounded-3xl focus:border-blue-500/50 shadow-2xl relative z-10 font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Leads List */}
            <div className="grid gap-6">
                {loading ? (
                    <div className="py-24 text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                        <p className="text-slate-500 font-black uppercase text-xs tracking-widest animate-pulse">Sincronizando Leads...</p>
                    </div>
                ) : filteredLeads.length > 0 ? filteredLeads.map(lead => (
                    <Card key={lead.id} className="bg-[#0f172a] border-slate-800 rounded-[40px] hover:border-blue-500/30 transition-all duration-500 group overflow-hidden relative shadow-2xl">
                        {lead.status === 'registered' && (
                            <div className="absolute top-0 right-0 bg-green-500 text-[8px] font-black uppercase px-4 py-1 rounded-bl-2xl">Cliente Ativo</div>
                        )}
                        <CardContent className="p-8">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center font-black text-2xl italic shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-2xl group-hover:text-blue-400 transition-colors uppercase tracking-tighter italic">{lead.name}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Badge className={`${statusColors[lead.status]} text-[10px] py-0.5 px-3 uppercase font-black rounded-full border shadow-sm`}>
                                                {statusLabels[lead.status]}
                                            </Badge>
                                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 flex-1 xl:border-x border-slate-800/50 xl:px-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60 italic">WhatsApp</p>
                                        <a
                                            href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            className="flex items-center gap-3 text-lg font-black text-slate-200 hover:text-green-500 transition-colors tracking-tight"
                                        >
                                            <Smartphone className="w-5 h-5 text-green-500/50" />
                                            {lead.whatsapp}
                                            <ExternalLink className="w-3.5 h-3.5 opacity-20" />
                                        </a>
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60 italic">Notas / Conversa</p>
                                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                            <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                                                {lead.notes || 'Sem interações registradas.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60 italic">Academy</p>
                                        <p className="text-lg font-black text-slate-200 truncate italic tracking-tighter uppercase">{lead.academy_name || 'Individual'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end xl:self-center">
                                    {lead.status !== 'registered' ? (
                                        <Button
                                            onClick={() => { setSelectedLead(lead); setIsActivateModalOpen(true); }}
                                            className="h-14 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 rounded-2xl gap-3 font-black shadow-2xl shadow-blue-900/40 hover:scale-[1.03] transition-all text-xs uppercase italic px-6"
                                        >
                                            <Rocket className="w-5 h-5 animate-pulse" />
                                            ATIVAR CONTA
                                        </Button>
                                    ) : (
                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 py-4 px-6 rounded-2xl font-black italic shadow-xl">
                                            <CheckCircle className="w-5 h-5 mr-3" /> JÁ É CLIENTE
                                        </Badge>
                                    )}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl hover:bg-slate-800 transition-colors border border-slate-800">
                                                <MoreVertical className="w-6 h-6" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-[#0f172a] border-slate-800 text-white w-64 p-3 rounded-[24px] shadow-3xl">
                                            <p className="text-[10px] font-black text-slate-500 uppercase px-3 py-2 tracking-widest">Mover Pipeline</p>
                                            <DropdownMenuItem className="rounded-xl focus:bg-yellow-500/10 focus:text-yellow-400 p-4 font-bold transition-all" onClick={() => updateLeadStatus(lead.id, 'contacted')}>
                                                <MessageSquare className="w-4 h-4 mr-4 text-yellow-500" /> Em Contato
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl focus:bg-purple-500/10 focus:text-purple-400 p-4 font-bold transition-all" onClick={() => updateLeadStatus(lead.id, 'converted')}>
                                                <Building2 className="w-4 h-4 mr-4 text-purple-500" /> Convertido (Assinou)
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl focus:bg-slate-500/10 focus:text-slate-400 p-4 font-bold transition-all" onClick={() => updateLeadStatus(lead.id, 'lost')}>
                                                <Lock className="w-4 h-4 mr-4 text-slate-400" /> Perdido
                                            </DropdownMenuItem>
                                            <div className="h-px bg-slate-800 my-2" />
                                            <DropdownMenuItem className="rounded-xl focus:bg-red-500/10 focus:text-red-500 p-4 font-bold transition-all group" onClick={() => handleDeleteLead(lead.id)}>
                                                <Trash2 className="w-4 h-4 mr-4 group-hover:scale-110 transition-transform" /> Excluir Registro
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="py-32 text-center opacity-30 animate-pulse">
                        <Users className="w-20 h-20 mx-auto mb-6 text-slate-600" />
                        <p className="font-black italic uppercase tracking-widest text-lg">Radar de Leads Limpo</p>
                    </div>
                )}
            </div>

            {/* Modal de Ativação de Conta */}
            <Dialog open={isActivateModalOpen} onOpenChange={setIsActivateModalOpen}>
                <DialogContent className="bg-[#0f172a] border-slate-800 text-white rounded-[32px] max-w-sm">
                    <DialogHeader className="text-center">
                        <div className="w-20 h-20 bg-blue-600/20 rounded-full mx-auto flex items-center justify-center mb-4 border border-blue-500/30">
                            <Rocket className="w-10 h-10 text-blue-500 animate-bounce" />
                        </div>
                        <DialogTitle className="text-2xl font-black italic uppercase italic">Liberar Acesso Pro</DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                            {selectedLead ? `Deseja transformar ${selectedLead.name.split(' ')[0]} em um Administrador de Academia oficial?` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-xs font-bold text-blue-400 leading-relaxed">
                            🚨 Isso criará uma entrada na tabela de Academias e dará 7 dias de trial automáticos para este usuário.
                        </div>
                    </div>
                    <DialogFooter className="flex-col gap-2">
                        <Button onClick={handleActivateAccount} disabled={actionLoading} className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black italic text-lg shadow-xl shadow-blue-500/20 gap-2">
                            {actionLoading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    CONFIRMAR ATIVAÇÃO
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                        <Button variant="ghost" onClick={() => setIsActivateModalOpen(false)} className="w-full h-12 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cancelar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
