import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp, AlertTriangle, UserCheck, Clock, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface AttendanceRecord {
  id: string;
  date: string;
  class_id: string;
  training_classes?: {
    name: string;
  };
  attendance_students: Array<{ id: string }>;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  due_date: string;
  status: string;
  students?: {
    name: string;
  };
}

const AdminCTDashboard = () => {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeStudents: 0,
    totalStudents: 0,
    todayAttendance: 0,
    defaulters: 0,
    averageAttendance: 0,
    newLeads: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    activeClasses: 0
  });
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [ctName, setCtName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.ct_id) return;

      try {
        // Fetch CT name
        const { data: ctData } = await supabase
          .from('cts')
          .select('name')
          .eq('id', profile.ct_id)
          .single();
        
        if (ctData) setCtName(ctData.name);

        // Fetch students count
        const { count: totalStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('ct_id', profile.ct_id);

        const { count: activeStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('ct_id', profile.ct_id)
          .eq('status', 'ativo');

        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0];
        const { data: todayAtt } = await supabase
          .from('attendance_records')
          .select('id, attendance_students(id)')
          .eq('ct_id', profile.ct_id)
          .eq('date', today);

        const todayCount = todayAtt?.reduce((acc, a) => acc + (a.attendance_students?.length || 0), 0) || 0;

        // Fetch overdue payments
        const { count: defaulters } = await supabase
          .from('financial_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('ct_id', profile.ct_id)
          .eq('status', 'atrasado');

        // Fetch leads
        const { count: leads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('ct_id', profile.ct_id)
          .eq('status', 'novo');

        // Fetch monthly revenue
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { data: revenueData } = await supabase
          .from('financial_transactions')
          .select('amount')
          .eq('ct_id', profile.ct_id)
          .eq('status', 'pago')
          .gte('paid_date', monthStart);

        const revenue = revenueData?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

        // Fetch pending payments
        const { data: pendingData } = await supabase
          .from('financial_transactions')
          .select('amount')
          .eq('ct_id', profile.ct_id)
          .eq('status', 'pendente');

        const pending = pendingData?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

        // Fetch active classes
        const { count: classesCount } = await supabase
          .from('training_classes')
          .select('*', { count: 'exact', head: true })
          .eq('ct_id', profile.ct_id)
          .eq('active', true);

        // Fetch recent attendance
        const { data: attData } = await supabase
          .from('attendance_records')
          .select(`
            id,
            date,
            class_id,
            training_classes(name),
            attendance_students(id)
          `)
          .eq('ct_id', profile.ct_id)
          .order('date', { ascending: false })
          .limit(3);

        if (attData) setRecentAttendance(attData as AttendanceRecord[]);

        // Fetch overdue transactions
        const { data: overdueData } = await supabase
          .from('financial_transactions')
          .select(`
            id,
            amount,
            description,
            due_date,
            status,
            students(name)
          `)
          .eq('ct_id', profile.ct_id)
          .eq('status', 'atrasado')
          .limit(5);

        if (overdueData) setPendingTransactions(overdueData as Transaction[]);

        setStats({
          activeStudents: activeStudents || 0,
          totalStudents: totalStudents || 0,
          todayAttendance: todayCount,
          defaulters: defaulters || 0,
          averageAttendance: 75,
          newLeads: leads || 0,
          monthlyRevenue: revenue,
          pendingPayments: pending,
          activeClasses: classesCount || 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profile?.ct_id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">{ctName} - Visão geral</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presença Hoje</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAttendance}</div>
            <p className="text-xs text-muted-foreground">alunos treinando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalStudents} matriculados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.defaulters}</div>
            <p className="text-xs text-muted-foreground">pagamentos atrasados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">nos últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.newLeads}</p>
                <p className="text-xs text-muted-foreground">Novos Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(stats.monthlyRevenue / 1000).toFixed(1)}k</p>
                <p className="text-xs text-muted-foreground">Receita do Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(stats.pendingPayments / 1000).toFixed(1)}k</p>
                <p className="text-xs text-muted-foreground">A Receber</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeClasses}</p>
                <p className="text-xs text-muted-foreground">Turmas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Últimas Presenças</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAttendance.length > 0 ? recentAttendance.map(att => (
                <div key={att.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{att.training_classes?.name || 'Treino'}</p>
                    <p className="text-sm text-muted-foreground">{att.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{att.attendance_students?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">presentes</p>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4">Nenhuma presença registrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Pagamentos Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTransactions.length > 0 ? pendingTransactions.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div>
                    <p className="font-medium">{payment.students?.name || 'Aluno'}</p>
                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-destructive">R$ {Number(payment.amount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Venc: {payment.due_date}</p>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4">Nenhum pagamento atrasado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCTDashboard;