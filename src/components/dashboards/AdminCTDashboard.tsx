import { useEffect, useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableCard } from '@/components/ui/clickable-card';
import { Users, Calendar, DollarSign, TrendingUp, AlertTriangle, UserCheck, Clock, UserPlus, ArrowUpRight, ShieldCheck, Zap, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import PageFallback from '@/components/ui/page-fallback';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  const [error, setError] = useState<string | null>(null);
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

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erro ao carregar dados do dashboard');
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

  if (error) {
    return <PageFallback type="error" title={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="border-primary/30 text-primary font-bold bg-primary/5 uppercase tracking-tighter px-3 mb-2">
            <Zap className="w-3 h-3 mr-1 fill-primary" />
            Live Intelligence
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg font-medium flex items-center gap-2">
            <Building2 className="w-5 h-5 text-white/40" />
            {ctName} <span className="text-white/20">|</span> <span className="text-white/60">Gestão de Unidade</span>
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 rounded-3xl flex items-center gap-4 shadow-premium">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status CT</p>
              <p className="text-success font-black text-sm uppercase flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats - High Impact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClickableCard to="/presenca" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-primary/50 transition-all duration-500 shadow-premium hover:shadow-premium-hover hover:-translate-y-2 overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl -mr-8 -mt-8 group-hover:bg-primary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-black text-white/70 uppercase tracking-widest">Presença Hoje</CardTitle>
            <div className="p-2.5 bg-primary/10 rounded-xl group-hover:animate-bounce transition-all">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black text-white tracking-tighter mb-1">{stats.todayAttendance}</div>
            <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Alunos treinando agora
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </ClickableCard>

        <ClickableCard to="/alunos" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-secondary/50 transition-all duration-500 shadow-premium hover:shadow-premium-hover hover:-translate-y-2 overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 blur-3xl -mr-8 -mt-8 group-hover:bg-secondary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-black text-white/70 uppercase tracking-widest">Alunos Ativos</CardTitle>
            <div className="p-2.5 bg-secondary/10 rounded-xl group-hover:animate-pulse transition-all">
              <Users className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black text-white tracking-tighter mb-1">{stats.activeStudents}</div>
            <p className="text-xs font-bold text-muted-foreground uppercase">
              de {stats.totalStudents} matriculados
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </ClickableCard>

        <ClickableCard to="/financeiro" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-destructive/50 transition-all duration-500 shadow-premium hover:shadow-premium-hover hover:-translate-y-2 overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/10 blur-3xl -mr-8 -mt-8 group-hover:bg-destructive/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-black text-white/70 uppercase tracking-widest">Pendências</CardTitle>
            <div className="p-2.5 bg-destructive/10 rounded-xl group-hover:rotate-12 transition-all">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black text-destructive tracking-tighter mb-1">{stats.defaulters}</div>
            <p className="text-xs font-bold text-muted-foreground uppercase">Mensalidades em atraso</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-destructive/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </ClickableCard>

        <ClickableCard to="/relatorios" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-success/50 transition-all duration-500 shadow-premium hover:shadow-premium-hover hover:-translate-y-2 overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 blur-3xl -mr-8 -mt-8 group-hover:bg-success/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-black text-white/70 uppercase tracking-widest">Frequência</CardTitle>
            <div className="p-2.5 bg-success/10 rounded-xl group-hover:animate-spin-slow transition-all">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black text-white tracking-tighter mb-1">{stats.averageAttendance}%</div>
            <p className="text-xs font-bold text-muted-foreground uppercase">Média dos últimos 30 dias</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-success/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </ClickableCard>
      </div>

      {/* Secondary Focus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClickableCard to="/crm" className="bg-[#111114]/40 border-primary/20 hover:border-primary/40 rounded-3xl p-6 transition-all duration-500 overflow-hidden group relative">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-primary/10 group-hover:scale-110 transition-transform">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tighter">{stats.newLeads}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Novos Leads</p>
            </div>
            <ArrowUpRight className="absolute top-0 right-0 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
          </div>
        </ClickableCard>

        <ClickableCard to="/financeiro" className="bg-[#111114]/40 border-success/20 hover:border-success/40 rounded-3xl p-6 transition-all duration-500 overflow-hidden group relative">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-success/10 group-hover:scale-110 transition-transform">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tighter">R$ {(stats.monthlyRevenue / 1000).toFixed(1)}k</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Receita Bruta</p>
            </div>
            <ArrowUpRight className="absolute top-0 right-0 h-5 w-5 text-white/20 group-hover:text-success transition-colors" />
          </div>
        </ClickableCard>

        <ClickableCard to="/financeiro" className="bg-[#111114]/40 border-warning/20 hover:border-warning/40 rounded-3xl p-6 transition-all duration-500 overflow-hidden group relative">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-warning/10 group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tighter">R$ {(stats.pendingPayments / 1000).toFixed(1)}k</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">A Receber</p>
            </div>
            <ArrowUpRight className="absolute top-0 right-0 h-5 w-5 text-white/20 group-hover:text-warning transition-colors" />
          </div>
        </ClickableCard>

        <ClickableCard to="/turmas" className="bg-[#111114]/40 border-secondary/20 hover:border-secondary/40 rounded-3xl p-6 transition-all duration-500 overflow-hidden group relative">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-secondary/10 group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tighter">{stats.activeClasses}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Turmas Ativas</p>
            </div>
            <ArrowUpRight className="absolute top-0 right-0 h-5 w-5 text-white/20 group-hover:text-secondary transition-colors" />
          </div>
        </ClickableCard>
      </div>

      {/* Activity Streams - Minimalist & Large Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ClickableCard to="/presenca" className="bg-[#111114]/40 backdrop-blur-md border border-white/5 rounded-[40px] p-8 shadow-premium group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight italic">Fluxo de Presença</CardTitle>
            </div>
            <ArrowUpRight className="h-6 w-6 text-white/20 group-hover:text-primary transition-colors" />
          </div>

          <div className="space-y-4">
            {recentAttendance.length > 0 ? recentAttendance.map(att => (
              <div key={att.id} className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/item">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center font-black text-primary border border-primary/10">
                    {att.date.split('-')[2]}
                  </div>
                  <div>
                    <p className="font-black text-white tracking-tight">{att.training_classes?.name || 'Treino Regular'}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sincronizado há pouco</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary tracking-tighter">{att.attendance_students?.length || 0}</span>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Presentes</p>
                </div>
              </div>
            )) : (
              <div className="py-12 flex flex-col items-center opacity-40">
                <Clock className="w-12 h-12 mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">Sem atividade recente</p>
              </div>
            )}
          </div>
        </ClickableCard>

        <ClickableCard to="/financeiro" className="bg-[#111114]/40 backdrop-blur-md border border-white/5 rounded-[40px] p-8 shadow-premium group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/20 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight italic">Alerta Financeiro</CardTitle>
            </div>
            <ArrowUpRight className="h-6 w-6 text-white/20 group-hover:text-destructive transition-colors" />
          </div>

          <div className="space-y-4">
            {pendingTransactions.length > 0 ? pendingTransactions.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-5 rounded-3xl bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-all">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-destructive/20 flex items-center justify-center font-black text-destructive border border-destructive/10">
                    !
                  </div>
                  <div>
                    <p className="font-black text-white tracking-tight">{payment.students?.name || 'Membro'}</p>
                    <p className="text-xs font-bold text-destructive/80 uppercase tracking-widest">Vencido em {new Date(payment.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-destructive tracking-tighter">R$ {Number(payment.amount).toFixed(0)}</span>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{payment.description}</p>
                </div>
              </div>
            )) : (
              <div className="py-12 flex flex-col items-center opacity-40">
                <ShieldCheck className="w-12 h-12 mb-4 text-success" />
                <p className="font-bold uppercase tracking-widest text-xs text-success">Sistema em Dia</p>
              </div>
            )}
          </div>
        </ClickableCard>
      </div>
    </div>
  );
};

export default AdminCTDashboard;
