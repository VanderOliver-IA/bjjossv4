import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Flag, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface CTData {
  id: string;
  name: string;
  subscription: string;
  subscription_status: string;
}

const SuperAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
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

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Geral</h1>
        <p className="text-muted-foreground">Visão geral do sistema BJJ OSS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTs Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCTs}</div>
            <p className="text-xs text-muted-foreground">
              {totalCTs} total registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Alunos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Flags</CardTitle>
            <Flag className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFlags}/{totalFlags}</div>
            <p className="text-xs text-muted-foreground">
              flags ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              CTs Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cts.map(ct => (
                <div key={ct.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{ct.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{ct.subscription}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ct.subscription_status === 'ativo' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {ct.subscription_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <Building2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{activeCTs} CTs ativos</p>
                  <p className="text-xs text-muted-foreground">Sistema funcionando normalmente</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Flag className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{activeFlags} features ativas</p>
                  <p className="text-xs text-muted-foreground">De {totalFlags} funcionalidades disponíveis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;