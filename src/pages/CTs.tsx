import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import ReportChart from '@/components/reports/ReportChart';
import DateRangeFilter, { DateRange, getDateRangeForPeriod } from '@/components/reports/DateRangeFilter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  { id: '1', name: 'Gracie Barra Centro', cnpj: '12.345.678/0001-00', address: 'Rua Principal, 123', phone: '(11) 3333-0001', email: 'centro@graciebarra.com', subscription: 'pro', subscriptionStatus: 'ativo', subscriptionValue: 299, subscriptionDueDay: 10, totalStudents: 85, createdAt: '2023-01-15', lastPayment: '2024-01-10' },
  { id: '2', name: 'Alliance SP', cnpj: '98.765.432/0001-00', address: 'Av. Paulista, 456', phone: '(11) 3333-0002', email: 'sp@alliance.com', subscription: 'enterprise', subscriptionStatus: 'ativo', subscriptionValue: 499, subscriptionDueDay: 5, totalStudents: 150, createdAt: '2022-06-20', lastPayment: '2024-01-05' },
];

const subscriptionLabels: Record<SubscriptionType, string> = { trial: 'Trial', basic: 'Basic', pro: 'Pro', enterprise: 'Enterprise' };
const subscriptionColors: Record<SubscriptionType, string> = { trial: 'bg-muted text-muted-foreground', basic: 'bg-bjj-azul text-white', pro: 'bg-bjj-roxo text-white', enterprise: 'bg-primary text-primary-foreground' };
const statusLabels: Record<SubscriptionStatus, string> = { ativo: 'Ativo', inativo: 'Inativo', pendente: 'Pendente' };
const statusColors: Record<SubscriptionStatus, string> = { ativo: 'bg-primary', inativo: 'bg-destructive', pendente: 'bg-yellow-500' };

const CTs = () => {
  const navigate = useNavigate();
  const { setViewAsCT, setViewAsRole } = useAuth();
  const { toast } = useToast();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão Global - BjjOss</h1>
          <p className="text-muted-foreground">Administre as academias e assinaturas da plataforma</p>
        </div>

        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" /> Novo CT
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de CTs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{cts.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Receita</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ 5.400</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Alunos Totais</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">1.240</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Trials Ativos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">12</div></CardContent></Card>
      </div>

      <Card><CardContent className="pt-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar CT..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></CardContent></Card>

      <div className="space-y-4">
        {filteredCTs.map(ct => (
          <Card key={ct.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedCT(ct)}>
            <CardContent className="pt-4"><div className="flex items-center justify-between"><div><h3 className="font-bold">{ct.name}</h3><p className="text-xs text-muted-foreground">{ct.email}</p></div><Badge className={subscriptionColors[ct.subscription]}>{subscriptionLabels[ct.subscription]}</Badge></div></CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedCT} onOpenChange={() => setSelectedCT(null)}>
        <DialogContent className="max-w-2xl bg-[#0f172a] text-white border-slate-800">
          {selectedCT && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" /> {selectedCT.name}
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="support" className="mt-4">
                <TabsList className="bg-slate-900 border-slate-800">
                  <TabsTrigger value="support">Suporte</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>
                <TabsContent value="support" className="space-y-4 py-4">
                  <div className="p-6 border-2 border-dashed border-blue-500/30 rounded-2xl bg-blue-500/5 space-y-4 text-center">
                    <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto" />
                    <div>
                      <h3 className="font-bold text-lg">Acesso de Suporte Auditado</h3>
                      <p className="text-xs text-slate-400">Entre no sistema deste cliente para resolver problemas técnicos. Todo acesso é registrado seguindo a LGPD.</p>
                    </div>
                    <Button
                      onClick={() => {
                        setViewAsCT(selectedCT.id);
                        setViewAsRole('admin_ct');
                        navigate('/dashboard');
                        toast({ title: "Modo Suporte Ativado", description: `Você está logado como suporte em ${selectedCT.name}` });
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 h-12 font-black"
                    >
                      ACESSAR COMO SUPORTE (24H)
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="info" className="py-4 grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800"><p className="text-[10px] text-slate-500 uppercase font-bold text-xs mb-1">CNPJ</p><p>{selectedCT.cnpj || 'N/A'}</p></div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800"><p className="text-[10px] text-slate-500 uppercase font-bold text-xs mb-1">Telefone</p><p>{selectedCT.phone}</p></div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-2"><p className="text-[10px] text-slate-500 uppercase font-bold text-xs mb-1">Endereço</p><p>{selectedCT.address}</p></div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CTs;
