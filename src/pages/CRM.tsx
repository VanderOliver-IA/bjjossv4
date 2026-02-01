import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Phone, Mail, MessageSquare, UserPlus, Filter } from 'lucide-react';
import ReportChart from '@/components/reports/ReportChart';
import DateRangeFilter, { DateRange, getDateRangeForPeriod } from '@/components/reports/DateRangeFilter';

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
  createdAt: string;
  lastContact?: string;
}

const mockLeads: Lead[] = [
  { id: '1', name: 'Carlos Mendes', phone: '(11) 99999-1111', email: 'carlos@email.com', status: 'novo', source: 'instagram', createdAt: '2024-01-15' },
  { id: '2', name: 'Fernanda Lima', phone: '(11) 99999-2222', email: 'fernanda@email.com', status: 'contatado', source: 'facebook', createdAt: '2024-01-14', lastContact: '2024-01-15' },
  { id: '3', name: 'Ricardo Souza', phone: '(11) 99999-3333', status: 'agendado', source: 'indicacao', createdAt: '2024-01-13', lastContact: '2024-01-14' },
  { id: '4', name: 'Amanda Costa', phone: '(11) 99999-4444', email: 'amanda@email.com', status: 'experimental', source: 'site', createdAt: '2024-01-12' },
  { id: '5', name: 'Bruno Alves', phone: '(11) 99999-5555', status: 'matriculado', source: 'indicacao', createdAt: '2024-01-10' },
  { id: '6', name: 'Julia Santos', phone: '(11) 99999-6666', status: 'perdido', source: 'outros', createdAt: '2024-01-08', notes: 'Sem interesse no momento' },
];

const statusLabels: Record<LeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  agendado: 'Agendado',
  experimental: 'Experimental',
  matriculado: 'Matriculado',
  perdido: 'Perdido',
};

const statusColors: Record<LeadStatus, string> = {
  novo: 'bg-blue-500',
  contatado: 'bg-yellow-500',
  agendado: 'bg-purple-500',
  experimental: 'bg-orange-500',
  matriculado: 'bg-primary',
  perdido: 'bg-destructive',
};

const sourceLabels: Record<LeadSource, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  indicacao: 'Indicação',
  site: 'Site',
  outros: 'Outros',
};

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeForPeriod('30days'));
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const leadsByStatus = Object.entries(statusLabels).map(([status, label]) => ({
    name: label,
    value: leads.filter(l => l.status === status).length,
  }));

  const leadsBySource = Object.entries(sourceLabels).map(([source, label]) => ({
    name: label,
    value: leads.filter(l => l.source === source).length,
  }));

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus, lastContact: new Date().toISOString().split('T')[0] }
        : lead
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CRM / Leads</h1>
          <p className="text-muted-foreground">Gestão de leads e funil de vendas</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input placeholder="Nome completo" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input placeholder="(00) 00000-0000" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="email@exemplo.com" />
              </div>
              <div>
                <Label>Origem</Label>
                <Select defaultValue="outros">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(sourceLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea placeholder="Notas sobre o lead..." />
              </div>
              <Button className="w-full" onClick={() => setIsAddOpen(false)}>
                Salvar Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-4">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Novos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {leads.filter(l => l.status === 'novo').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Matriculados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {leads.filter(l => l.status === 'matriculado').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((leads.filter(l => l.status === 'matriculado').length / leads.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart title="Leads por Status" data={leadsByStatus} defaultType="pie" />
        <ReportChart title="Leads por Origem" data={leadsBySource} defaultType="bar" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome ou telefone..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map(lead => (
          <Card key={lead.id}>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{lead.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </span>
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {lead.email}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{sourceLabels[lead.source]}</Badge>
                      {lead.lastContact && (
                        <span className="text-xs text-muted-foreground">
                          Último contato: {new Date(lead.lastContact).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select 
                    value={lead.status} 
                    onValueChange={(v) => handleStatusChange(lead.id, v as LeadStatus)}
                  >
                    <SelectTrigger className="w-36">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColors[lead.status]}`} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusColors[value as LeadStatus]}`} />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CRM;
