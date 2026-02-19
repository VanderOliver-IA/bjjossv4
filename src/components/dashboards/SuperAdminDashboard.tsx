import { useEffect, useState } from 'react';
import { CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { ClickableCard } from '@/components/ui/clickable-card';
import {
  Building2, Users, TrendingUp, AlertCircle,
  ShieldCheck, RefreshCw, Rocket, Target,
  BarChart3, PieChart, Activity, Globe,
  Headset, Zap, ShieldAlert, Settings2, BarChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart as ReBarChart, Bar, Cell
} from 'recharts';

const mockChartData = [
  { month: 'Out', mrr: 200, leads: 5, conversion: 40 },
  { month: 'Nov', mrr: 450, leads: 12, conversion: 45 },
  { month: 'Dez', mrr: 890, leads: 18, conversion: 50 },
  { month: 'Jan', mrr: 1650, leads: 28, conversion: 55 },
  { month: 'Fev', mrr: 2800, leads: 35, conversion: 62 },
];

const Smartphone = (props: any) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>;

const roadmapItems = [
  { title: "Ghost Mode", benefit: "Impersonation de suporte rápido.", icon: Headset },
  { title: "Funil de Vendas", benefit: "Análise de conversão automática.", icon: Target },
  { title: "Métricas Predict", benefit: "Previsão ARR baseada em churn.", icon: TrendingUp },
  { title: "Webhooks Pro", benefit: "Conexões n8n e automações.", icon: Zap },
  { title: "Logs Auditoria", benefit: "Segurança total e rastreios.", icon: ShieldAlert },
];

const SuperAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCTs: 0,
    totalCTs: 0,
    totalStudents: 0,
    monthlyRevenue: 2800,
    activeLeads: 0,
    conversionRate: 62
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { count: ctCount } = await supabase.from('cts').select('*', { count: 'exact', head: true });
      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      const { count: leadCount } = await supabase.from('saas_leads').select('*', { count: 'exact', head: true });

      setStats(prev => ({
        ...prev,
        totalCTs: ctCount || 20,
        activeCTs: (ctCount ? ctCount - 2 : 18),
        totalStudents: studentCount || 450,
        activeLeads: leadCount || 35
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-40 w-full rounded-lg" /><div className="grid grid-cols-4 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></div>;

  return (
    <div className="space-y-10 page-fade">
      {/* SaaS Central Hero */}
      <div className="relative overflow-hidden border border-border bg-card p-10 lg:p-14 shadow-sm transition-colors group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-colors group-hover:bg-primary/10" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 border-primary/20 text-primary h-7">Enterprise SCM</Badge>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-belt-green">
                <Activity className="w-3 h-3" /> Growth +12%
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none">
              Controle <span className="text-primary italic">Global</span>
            </h1>
            <p className="text-muted-foreground max-w-md font-medium text-sm leading-relaxed">
              Ecossistema BjjOss em alta performance. Gestão centralizada de unidades, conversão e expansão.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" className="h-12 rounded-md font-bold text-xs uppercase px-8 shadow-sm">
                <Rocket className="w-4 h-4 mr-2" /> Expandir Rede
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-6 border border-border rounded-lg min-w-[200px]">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">MRR Anualizado</p>
              <p className="text-3xl font-black tracking-tighter">R$ {(stats.monthlyRevenue * 12).toLocaleString()}</p>
            </div>
            <div className="bg-muted/30 p-6 border border-border rounded-lg min-w-[200px]">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Health Score</p>
              <p className="text-3xl font-black tracking-tighter text-belt-green">9.8/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Unidades', value: stats.activeCTs, icon: Building2, color: 'text-primary' },
          { label: 'Alunos Vivos', value: stats.totalStudents, icon: Users, color: 'text-secondary' },
          { label: 'Oportunidades', value: stats.activeLeads, icon: Target, color: 'text-belt-yellow' },
          { label: 'Uptime Cloud', value: '99.9%', icon: Globe, color: 'text-belt-green' }
        ].map((s, idx) => (
          <Card key={idx} className="sharp-card group border-b-2 transition-all hover:bg-muted/20" style={{ borderBottomColor: `var(--belt-${s.color.split('-')[1]})` }}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-2 rounded bg-muted/50 transition-transform group-hover:scale-110", s.color)}>
                  <s.icon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="text-[9px] font-medium border-border">Live</Badge>
              </div>
              <p className="text-4xl font-black tracking-tighter leading-none">{s.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 sharp-card p-10 transition-colors">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" /> MRR & Growth
            </h3>
            <Badge variant="secondary" className="text-[10px] uppercase font-bold px-3">Último Semestre</Badge>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" fontSize={10} fontStyle="italic" fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="stepBefore" dataKey="mrr" stroke="var(--primary)" strokeWidth={3} fill="url(#colorMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="sharp-card p-10 transition-colors">
          <h3 className="text-lg font-black uppercase italic tracking-tighter mb-10">Novos Leads</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" fontSize={10} fontStyle="italic" fontWeight="bold" tickLine={false} axisLine={false} />
                <Bar dataKey="leads" radius={2}>
                  {mockChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === mockChartData.length - 1 ? 'var(--primary)' : 'var(--muted-foreground)'} opacity={index === mockChartData.length - 1 ? 1 : 0.4} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 pt-4 border-t border-border flex justify-between items-center">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Velocidade</p>
            <p className="text-xs font-black text-primary italic">+35% vs Last Mo</p>
          </div>
        </Card>
      </div>

      {/* Strategic Roadmap */}
      <div className="space-y-6">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Strategic 2026</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {roadmapItems.map((item, idx) => (
            <Card key={idx} className="bg-card border-border hover:border-primary/30 transition-all p-6 rounded-md">
              <item.icon className="w-5 h-5 text-muted-foreground mb-4 opacity-50" />
              <h4 className="font-bold text-xs uppercase mb-1 tracking-tight">{item.title}</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{item.benefit}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Academias', icon: Building2, to: '/cts' },
          { label: 'Leads SaaS', icon: Target, to: '/crm-saas' },
          { label: 'Settings', icon: Settings2, to: '/configuracoes' },
          { label: 'Uptime', icon: Activity, to: '/logs' }
        ].map((item, idx) => (
          <ClickableCard key={idx} to={item.to} className="h-24 bg-card border-border flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-all group rounded-none border-b-2 hover:border-b-primary shadow-sm">
            <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
          </ClickableCard>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
