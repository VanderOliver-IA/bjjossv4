import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Search, Phone, Mail, MessageSquare, UserPlus, Filter,
  ChevronRight, MoreHorizontal, ArrowRight, TrendingUp, Target, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type LeadStatus = 'novo' | 'contatado' | 'agendado' | 'experimental' | 'matriculado' | 'perdido';
type LeadSource = 'instagram' | 'facebook' | 'indicacao' | 'site' | 'outros';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  created_at: string;
  last_contact?: string;
}

const statusLabels: Record<LeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  agendado: 'Agendado',
  experimental: 'Aula Exp.',
  matriculado: 'Matriculado',
  perdido: 'Perdido',
};

const statusColors: Record<LeadStatus, string> = {
  novo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contatado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  agendado: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  experimental: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  matriculado: 'bg-primary/20 text-primary border-primary/30',
  perdido: 'bg-destructive/20 text-destructive border-destructive/30',
};

const CRM = () => {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile?.ct_id) {
      fetchLeads();
    }
  }, [profile?.ct_id]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('ct_id', profile?.ct_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast.error('Erro ao carregar leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          status: newStatus,
          last_contact: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;

      // Log action to audit_logs
      await supabase.from('audit_logs').insert({
        ct_id: profile?.ct_id,
        user_id: profile?.user_id,
        action: 'UPDATE',
        table_name: 'leads',
        record_id: leadId,
        new_data: { status: newStatus }
      });

      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success('Status atualizado com sucesso');
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Erro ao atualizar status');
    }
  };

  const columns: LeadStatus[] = ['novo', 'contatado', 'agendado', 'experimental', 'matriculado'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 text-primary font-bold bg-primary/5 uppercase tracking-tighter px-3">
            <Target className="w-3 h-3 mr-1" />
            Sales Pipeline
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            Gestão de Leads
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl">
            Converta interessados em campeões. <span className="text-white/60">Acompanhe seu funil de vendas com automação e inteligência.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setViewMode(viewMode === 'list' ? 'pipeline' : 'list')}
            variant="outline"
            className="h-14 px-6 rounded-2xl bg-white/5 border-white/10 font-bold gap-2"
          >
            {viewMode === 'list' ? <Zap className="w-5 h-5 text-primary" /> : <Filter className="w-5 h-5 text-primary" />}
            {viewMode === 'list' ? 'Ver Pipeline' : 'Ver Lista'}
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-primary text-black font-black gap-2 shadow-neon hover:scale-105 transition-all">
            <Plus className="w-5 h-5" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Conversão', val: '42%', icon: TrendingUp, color: 'text-primary' },
          { label: 'Novos (7d)', val: leads.filter(l => l.status === 'novo').length, icon: UserPlus, color: 'text-blue-400' },
          { label: 'Agendados', val: leads.filter(l => l.status === 'agendado').length, icon: Zap, color: 'text-purple-400' },
          { label: 'Matrículas', val: leads.filter(l => l.status === 'matriculado').length, icon: Target, color: 'text-success' },
        ].map((s, i) => (
          <Card key={i} className="bg-white/[0.03] border-white/5 rounded-3xl overflow-hidden group hover:border-primary/20 transition-all duration-500 shadow-premium">
            <CardContent className="p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <div className="text-3xl font-black text-white leading-none mb-1">{s.val}</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="text-success">+12%</span> vs período anterior
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      {viewMode === 'pipeline' ? (
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
          {columns.map(status => (
            <div key={status} className="flex-shrink-0 w-[320px] space-y-4 snap-start">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", statusColors[status].split(' ')[0])} />
                  <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/50">{statusLabels[status]}</h3>
                  <Badge variant="outline" className="border-white/5 text-[10px] font-black bg-white/5">{leads.filter(l => l.status === status).length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4 min-h-[500px] p-2 rounded-[32px] bg-white/[0.01] border border-white/5">
                {leads.filter(l => l.status === status).map(lead => (
                  <Card
                    key={lead.id}
                    className="bg-[#111114]/80 backdrop-blur-xl border border-white/5 rounded-2xl group hover:border-primary/30 hover:shadow-premium transition-all duration-300 cursor-pointer overflow-hidden p-5"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white leading-tight group-hover:text-primary transition-colors">{lead.name}</h4>
                        <Badge variant="outline" className="text-[9px] border-white/5 uppercase bg-white/5">{lead.source}</Badge>
                      </div>

                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">{lead.phone}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 text-white/40 hover:text-primary hover:bg-primary/10">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 text-white/40 hover:text-primary hover:bg-primary/10">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={() => {
                            const nextStatusMap: Record<string, LeadStatus> = {
                              'novo': 'contatado',
                              'contatado': 'agendado',
                              'agendado': 'experimental',
                              'experimental': 'matriculado'
                            };
                            if (nextStatusMap[status]) handleUpdateStatus(lead.id, nextStatusMap[status]);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-2 text-[10px] font-black uppercase text-white/20 hover:text-primary hover:bg-transparent"
                        >
                          Avançar <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {leads.filter(l => l.status === status).length === 0 && (
                  <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/10 italic">Vazio</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="bg-[#111114]/50 border-white/5 rounded-[32px] overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight text-white line-gradient">Lista de Leads</CardTitle>
                <CardDescription className="text-muted-foreground">Gerenciamento tabular de potenciais alunos</CardDescription>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  className="h-12 pl-10 bg-white/5 border-white/10 rounded-xl"
                  placeholder="Buscar leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lead</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Origem</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cadastro</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </td>
                    </tr>
                  ) : leads.map(lead => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-black text-primary border border-white/5">
                            {lead.name.charAt(0)}
                          </div>
                          <div>
                            <h5 className="font-bold text-white group-hover:text-primary transition-colors">{lead.name}</h5>
                            <p className="text-xs text-muted-foreground">{lead.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <Badge className={cn("font-black text-[10px] tracking-widest border", statusColors[lead.status])}>
                          {statusLabels[lead.status]}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <span className="text-xs font-bold text-white/50 lowercase tracking-widest">{lead.source}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-xs font-medium text-muted-foreground italic">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl bg-white/5">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl bg-white/5">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl bg-white/5">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CRM;
