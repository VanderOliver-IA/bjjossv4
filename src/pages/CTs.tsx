import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Plus, 
  Search, 
  Users, 
  DollarSign, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ReportChart from '@/components/reports/ReportChart';
import DateRangeFilter, { DateRange, getDateRangeForPeriod } from '@/components/reports/DateRangeFilter';

type SubscriptionType = 'trial' | 'basic' | 'pro' | 'enterprise';
type SubscriptionStatus = 'ativo' | 'inativo' | 'pendente';

interface CT {
  id: string;
  name: string;
  cnpj?: string;
  address: string;
  phone: string;
  email: string;
  subscription: SubscriptionType;
  subscriptionStatus: SubscriptionStatus;
  subscriptionValue: number;
  subscriptionDueDay: number;
  totalStudents: number;
  createdAt: string;
  lastPayment?: string;
}

const mockCTs: CT[] = [
  { 
    id: '1', 
    name: 'Gracie Barra Centro', 
    cnpj: '12.345.678/0001-00',
    address: 'Rua Principal, 123 - Centro',
    phone: '(11) 3333-0001',
    email: 'centro@graciebarra.com',
    subscription: 'pro',
    subscriptionStatus: 'ativo',
    subscriptionValue: 299,
    subscriptionDueDay: 10,
    totalStudents: 85,
    createdAt: '2023-01-15',
    lastPayment: '2024-01-10'
  },
  { 
    id: '2', 
    name: 'Alliance SP', 
    cnpj: '98.765.432/0001-00',
    address: 'Av. Paulista, 456',
    phone: '(11) 3333-0002',
    email: 'sp@alliance.com',
    subscription: 'enterprise',
    subscriptionStatus: 'ativo',
    subscriptionValue: 499,
    subscriptionDueDay: 5,
    totalStudents: 150,
    createdAt: '2022-06-20',
    lastPayment: '2024-01-05'
  },
  { 
    id: '3', 
    name: 'Checkmat Norte', 
    address: 'Rua das Flores, 789',
    phone: '(11) 3333-0003',
    email: 'norte@checkmat.com',
    subscription: 'basic',
    subscriptionStatus: 'pendente',
    subscriptionValue: 149,
    subscriptionDueDay: 15,
    totalStudents: 45,
    createdAt: '2023-08-10'
  },
  { 
    id: '4', 
    name: 'Nova Academia', 
    address: 'Rua Nova, 101',
    phone: '(11) 3333-0004',
    email: 'contato@novaacademia.com',
    subscription: 'trial',
    subscriptionStatus: 'ativo',
    subscriptionValue: 0,
    subscriptionDueDay: 1,
    totalStudents: 12,
    createdAt: '2024-01-01'
  },
];

const subscriptionLabels: Record<SubscriptionType, string> = {
  trial: 'Trial',
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const subscriptionColors: Record<SubscriptionType, string> = {
  trial: 'bg-muted text-muted-foreground',
  basic: 'bg-bjj-azul text-white',
  pro: 'bg-bjj-roxo text-white',
  enterprise: 'bg-primary text-primary-foreground',
};

const statusLabels: Record<SubscriptionStatus, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  pendente: 'Pendente',
};

const statusColors: Record<SubscriptionStatus, string> = {
  ativo: 'bg-primary',
  inativo: 'bg-destructive',
  pendente: 'bg-yellow-500',
};

const CTs = () => {
  const [cts] = useState<CT[]>(mockCTs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeForPeriod('30days'));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCT, setSelectedCT] = useState<CT | null>(null);

  const filteredCTs = cts.filter(ct => {
    const matchesSearch = ct.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ct.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = cts
    .filter(ct => ct.subscriptionStatus === 'ativo')
    .reduce((sum, ct) => sum + ct.subscriptionValue, 0);

  const totalStudents = cts.reduce((sum, ct) => sum + ct.totalStudents, 0);

  const revenueByPlan = Object.entries(subscriptionLabels).map(([plan, label]) => ({
    name: label,
    value: cts.filter(ct => ct.subscription === plan).reduce((sum, ct) => sum + ct.subscriptionValue, 0),
  }));

  const ctsByPlan = Object.entries(subscriptionLabels).map(([plan, label]) => ({
    name: label,
    value: cts.filter(ct => ct.subscription === plan).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Centros de Treinamento</h1>
          <p className="text-muted-foreground">Gestão de CTs e assinaturas do BJJ OSS</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo CT
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Novo CT</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do CT</Label>
                <Input placeholder="Nome da academia" />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input placeholder="00.000.000/0000-00" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="contato@academia.com" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input placeholder="(00) 0000-0000" />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input placeholder="Endereço completo" />
              </div>
              <div>
                <Label>Plano</Label>
                <Select defaultValue="basic">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(subscriptionLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => setIsAddOpen(false)}>
                Criar CT
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
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Total de CTs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cts.length}</div>
            <p className="text-xs text-muted-foreground">
              {cts.filter(ct => ct.subscriptionStatus === 'ativo').length} ativos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">recorrente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-bjj-azul" />
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">em todos os CTs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Pendências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {cts.filter(ct => ct.subscriptionStatus === 'pendente').length}
            </div>
            <p className="text-xs text-muted-foreground">pagamentos pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart title="Receita por Plano" data={revenueByPlan} defaultType="pie" />
        <ReportChart title="CTs por Plano" data={ctsByPlan} defaultType="bar" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar CT..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CT Detail Dialog */}
      <Dialog open={!!selectedCT} onOpenChange={() => setSelectedCT(null)}>
        <DialogContent className="max-w-2xl">
          {selectedCT && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedCT.name}
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="info">
                <TabsList>
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="financial">Financeiro</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">CNPJ</p>
                      <p className="font-medium">{selectedCT.cnpj || '-'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Alunos</p>
                      <p className="font-medium">{selectedCT.totalStudents}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedCT.phone}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedCT.email}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedCT.address}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      Cliente desde {new Date(selectedCT.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="financial" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Plano</p>
                      <Badge className={subscriptionColors[selectedCT.subscription]}>
                        {subscriptionLabels[selectedCT.subscription]}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Valor Mensal</p>
                      <p className="font-medium text-xl">
                        R$ {selectedCT.subscriptionValue.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Dia de Vencimento</p>
                      <p className="font-medium">Dia {selectedCT.subscriptionDueDay}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Último Pagamento</p>
                      <p className="font-medium">
                        {selectedCT.lastPayment 
                          ? new Date(selectedCT.lastPayment).toLocaleDateString('pt-BR')
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">Registrar Pagamento</Button>
                    <Button variant="outline">Alterar Plano</Button>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Pagamento recebido</p>
                        <p className="text-sm text-muted-foreground">R$ 299,00 - Pro</p>
                      </div>
                      <span className="ml-auto text-sm text-muted-foreground">10/01/2024</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Upgrade de plano</p>
                        <p className="text-sm text-muted-foreground">Basic → Pro</p>
                      </div>
                      <span className="ml-auto text-sm text-muted-foreground">01/01/2024</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CTs List */}
      <div className="space-y-4">
        {filteredCTs.map(ct => (
          <Card 
            key={ct.id} 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setSelectedCT(ct)}
          >
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{ct.name}</h3>
                      <div className={`w-2 h-2 rounded-full ${statusColors[ct.subscriptionStatus]}`} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {ct.totalStudents} alunos
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> 
                        Desde {new Date(ct.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      R$ {ct.subscriptionValue.toLocaleString('pt-BR')}/mês
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Venc. dia {ct.subscriptionDueDay}
                    </p>
                  </div>
                  <Badge className={subscriptionColors[ct.subscription]}>
                    {subscriptionLabels[ct.subscription]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CTs;
