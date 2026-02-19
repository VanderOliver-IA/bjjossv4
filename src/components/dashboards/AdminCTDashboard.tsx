import { useEffect, useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableCard } from '@/components/ui/clickable-card';
import { Users, Calendar, DollarSign, TrendingUp, AlertTriangle, UserCheck, Clock, UserPlus, ArrowUpRight, ShieldCheck, Zap, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import PageFallback from '@/components/ui/page-fallback';
import { Badge } from '@/components/ui/badge';
import { TrialBanner } from '@/components/dashboard/TrialBanner';

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
        const { data: ctData } = await supabase.from('cts').select('name').eq('id', profile.ct_id).single();
        if (ctData) setCtName(ctData.name);

        const { count: totalStudents } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('ct_id', profile.ct_id);
        const { count: activeStudents } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('ct_id', profile.ct_id).eq('status', 'ativo');

        const today = new Date().toISOString().split('T')[0];
        const { data: todayAtt } = await supabase.from('attendance_records').select('id, attendance_students(id)').eq('ct_id', profile.ct_id).eq('date', today);
        const todayCount = todayAtt?.reduce((acc, a) => acc + (a.attendance_students?.length || 0), 0) || 0;

        const { count: defaulters } = await supabase.from('financial_transactions').select('*', { count: 'exact', head: true }).eq('ct_id', profile.ct_id).eq('status', 'atrasado');
        const { count: leads } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('ct_id', profile.ct_id).eq('status', 'novo');

        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { data: revenueData } = await supabase.from('financial_transactions').select('amount').eq('ct_id', profile.ct_id).eq('status', 'pago').gte('paid_date', monthStart);
        const revenue = revenueData?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

        const { data: pendingData } = await supabase.from('financial_transactions').select('amount').eq('ct_id', profile.ct_id).eq('status', 'pendente');
        const pending = pendingData?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

        const { count: classesCount } = await supabase.from('training_classes').select('*', { count: 'exact', head: true }).eq('ct_id', profile.ct_id).eq('active', true);

        const { data: attData } = await supabase.from('attendance_records').select(`id, date, class_id, training_classes(name), attendance_students(id)`).eq('ct_id', profile.ct_id).order('date', { ascending: false }).limit(3);
        if (attData) setRecentAttendance(attData as AttendanceRecord[]);

        const { data: overdueData } = await supabase.from('financial_transactions').select(`id, amount, description, due_date, status, students(name)`).eq('ct_id', profile.ct_id).eq('status', 'atrasado').limit(5);
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
        console.error(err);
        setError('Erro ao carregar dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profile?.ct_id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <PageFallback type="error" title={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      <TrialBanner />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="border-primary/30 text-primary font-bold bg-primary/5 uppercase tracking-tighter px-3 mb-2">
            <Zap className="w-3 h-3 mr-1 fill-primary" />
            Live Intelligence
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter italic">Dashboard</h1>
          <p className="text-muted-foreground text-lg font-medium flex items-center gap-2">
            <Building2 className="w-5 h-5 text-white/40" />
            {ctName} <span className="text-white/20">|</span> <span>Gestão de Unidade</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClickableCard to="/presenca" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-primary/50 transition-all p-6 rounded-[32px] group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-black text-white/70 uppercase tracking-widest">Presença Hoje</p>
            <div className="p-2 bg-primary/10 rounded-xl"><UserCheck className="h-5 w-5 text-primary" /></div>
          </div>
          <div className="text-5xl font-black text-white tracking-tighter">{stats.todayAttendance}</div>
        </ClickableCard>

        <ClickableCard to="/alunos" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-secondary/50 transition-all p-6 rounded-[32px] group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-black text-white/70 uppercase tracking-widest">Alunos Ativos</p>
            <div className="p-2 bg-secondary/10 rounded-xl"><Users className="h-5 w-5 text-secondary" /></div>
          </div>
          <div className="text-5xl font-black text-white tracking-tighter">{stats.activeStudents}</div>
        </ClickableCard>

        <ClickableCard to="/financeiro" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-destructive/50 transition-all p-6 rounded-[32px] group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-black text-white/70 uppercase tracking-widest">Pendências</p>
            <div className="p-2 bg-destructive/10 rounded-xl"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
          </div>
          <div className="text-5xl font-black text-destructive tracking-tighter">{stats.defaulters}</div>
        </ClickableCard>

        <ClickableCard to="/relatorios" className="bg-[#111114]/50 backdrop-blur-xl border-white/5 hover:border-success/50 transition-all p-6 rounded-[32px] group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-black text-white/70 uppercase tracking-widest">Frequência</p>
            <div className="p-2 bg-success/10 rounded-xl"><TrendingUp className="h-5 w-5 text-success" /></div>
          </div>
          <div className="text-5xl font-black text-white tracking-tighter">{stats.averageAttendance}%</div>
        </ClickableCard>
      </div>
    </div>
  );
};

export default AdminCTDashboard;
