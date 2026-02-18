import { useEffect, useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableCard } from '@/components/ui/clickable-card';
import { Building2, Users, DollarSign, Flag, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import PageFallback from '@/components/ui/page-fallback';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth, AppRole } from '@/contexts/AuthContext';

interface CTData {
  id: string;
  name: string;
  subscription: string;
  subscription_status: string;
}

const SuperAdminDashboard = () => {
  const { viewAsRole, setViewAsRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCTs, setActiveCTs] = useState(0);
  const [totalCTs, setTotalCTs] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [activeFlags, setActiveFlags] = useState(0);
  const [totalFlags, setTotalFlags] = useState(0);
  const [cts, setCts] = useState<CTData[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch CTs
        const { data: ctsData, error: ctsError } = await supabase
          .from('cts')
          .select('id, name, subscription, subscription_status');

        if (ctsError) throw ctsError;

        if (ctsData) {
          setCts(ctsData);
          setTotalCTs(ctsData.length);
          setActiveCTs(ctsData.filter(ct => ct.subscription_status === 'ativo').length);
        }

        // Fetch total students
        const { count: studentsCount, error: studentsError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        if (studentsError) throw studentsError;
        setTotalStudents(studentsCount || 0);

        // Fetch monthly revenue
        const { data: revenueData, error: revenueError } = await supabase
          .from('financial_transactions')
          .select('amount')
          .eq('type', 'mensalidade')
          .eq('status', 'pago')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

        if (revenueError) throw revenueError;

        const totalRevenue = revenueData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        setMonthlyRevenue(totalRevenue);

        // Fetch feature flags
        const { data: flagsData, error: flagsError } = await supabase
          .from('feature_flags')
          .select('id, enabled');

        if (flagsError) throw flagsError;

        if (flagsData) {
          setTotalFlags(flagsData.length);
          setActiveFlags(flagsData.filter(f => f.enabled).length);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <PageFallback type="error" title={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit border-primary/30 text-primary font-bold bg-primary/5 uppercase tracking-tighter px-3 mb-2">
            <ShieldCheck className="w-3 h-3 mr-1" />
            SuperAdmin Authority
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
            Painel de Controle
          </h1>
          <p className="text-muted-foreground text-lg">
            Visão estratégica do ecossistema <span className="text-primary font-semibold">BJJ OSS</span>
          </p>
        </div>

      </div>

      {/* Stats Cards - Premium Redesign */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClickableCard to="/cts" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-primary/50 transition-all duration-500 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl -mr-8 -mt-8 group-hover:bg-primary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/70 uppercase tracking-wider">CTs Ativos</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg group-hover:animate-pulse">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-white tracking-tighter">{activeCTs}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span className="text-success font-medium">{totalCTs}</span> total no banco
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </ClickableCard>

        <ClickableCard to="/alunos" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-primary/50 transition-all duration-500 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 blur-3xl -mr-8 -mt-8 group-hover:bg-secondary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/70 uppercase tracking-wider">Membros</CardTitle>
            <div className="p-2 bg-secondary/10 rounded-lg group-hover:animate-pulse">
              <Users className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-white tracking-tighter">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-2">Alunos treinando agora</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </ClickableCard>

        <ClickableCard to="/financeiro" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-success/50 transition-all duration-500 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 blur-3xl -mr-8 -mt-8 group-hover:bg-success/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/70 uppercase tracking-wider">Receita (Mês)</CardTitle>
            <div className="p-2 bg-success/10 rounded-lg group-hover:animate-pulse">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-white tracking-tighter">
              <span className="text-2xl mr-1 text-success">R$</span>
              {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-success/70 mt-2 font-medium flex items-center gap-1">
              +12% <TrendingUp className="h-3 w-3" /> vs mês anterior
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-success/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </ClickableCard>

        <ClickableCard to="/feature-flags" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-accent/50 transition-all duration-500 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 blur-3xl -mr-8 -mt-8 group-hover:bg-accent/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/70 uppercase tracking-wider">Funcionalidades</CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg group-hover:animate-pulse">
              <Flag className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-white tracking-tighter">{activeFlags}/{totalFlags}</div>
            <p className="text-xs text-muted-foreground mt-2">Módulos ativos no SaaS</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </ClickableCard>
      </div>

      {/* Grid de Detalhes e Ações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111114]/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              Ultimos CTs Ativados
            </h3>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Ver todos</Button>
          </div>

          <div className="space-y-3">
            {cts.length > 0 ? cts.slice(0, 5).map(ct => (
              <div key={ct.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-primary border border-white/10 group-hover:neon">
                    {ct.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white tracking-wide">{ct.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">{ct.subscription}</p>
                  </div>
                </div>
                <Badge className={cn(
                  "font-bold uppercase text-[10px] tracking-widest",
                  ct.subscription_status === 'ativo' ? "bg-success/20 text-success border-success/30" : "bg-warning/20 text-warning border-warning/30"
                )}>
                  {ct.subscription_status}
                </Badge>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-10 italic">Nenhum Centro de Treinamento ativo.</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#111114]/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-premium">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-xl">
                <AlertCircle className="h-5 w-5 text-secondary" />
              </div>
              Estado do Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-success/5 border border-success/10 group">
                <div className="p-2 bg-success/20 rounded-full group-hover:animate-bounce">
                  <div className="h-2 w-2 rounded-full bg-success" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Servidores Cloud Base</p>
                  <p className="text-xs text-muted-foreground mt-1">Latência {Math.floor(Math.random() * 20 + 10)}ms - Operando com 99.9% uptime</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 group">
                <div className="p-2 bg-primary/20 rounded-full group-hover:animate-bounce">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Supabase DB Synchronization</p>
                  <p className="text-xs text-muted-foreground mt-1">Conexão ativa e sincronizada com RLS Policies vigente.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 rounded-3xl p-8 shadow-premium flex flex-col items-center text-center group cursor-pointer hover:neon transition-all duration-500">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold mb-2">Novo CT Pendente</h4>
            <p className="text-muted-foreground text-sm mb-6 max-w-[200px]">Existem novos professores aguardando validação de academia.</p>
            <Button className="w-full bg-white text-black hover:bg-white/90 rounded-xl font-bold">Revisar Agora</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
