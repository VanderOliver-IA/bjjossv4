import { useEffect, useState } from 'react';
import { CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { ClickableCard } from '@/components/ui/clickable-card';
import {
  Building2, Users, DollarSign, Flag, TrendingUp,
  AlertCircle, ShieldCheck, RefreshCw, Rocket,
  Target, BarChart3, PieChart, Activity, Globe,
  Headset, Zap, ShieldAlert, Settings2, BarChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
  { title: "Ghost Mode (Impersonation)", benefit: "Suporte técnico instantâneo vendo a tela do cliente.", icon: Headset },
  { title: "Funil de Vendas Automatizado", benefit: "Identifica onde o lead trava no onboarding.", icon: Target },
  { title: "Métricas ARR/MRR Predict", benefit: "Previsão de faturamento baseada no churn atual.", icon: TrendingUp },
  { title: "Gestor de Webhooks (n8n)", benefit: "Integração low-code com marketing externo.", icon: Zap },
  { title: "Logs de Auditoria LGPD", benefit: "Segurança jurídica e rastreabilidade total.", icon: ShieldAlert },
  { title: "A/B Testing de Assinaturas", benefit: "Teste novos preços para grupos específicos.", icon: BarChart3 },
  { title: "NPS e Health Score", benefit: "Mede o quanto os mestres amam o BjjOss.", icon: Activity },
  { title: "Multi-Region Cloud Sync", benefit: "Performance global para expansão internacional.", icon: Globe },
  { title: "Admin Mobile Dashboard", benefit: "Gerencie o SaaS direto pelo celular.", icon: Smartphone },
  { title: "Custom CT Whitelabel", benefit: "Venda a tecnologia para grandes federações.", icon: Settings2 },
];

const SuperAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCTs: 0,
    totalCTs: 0,
    totalStudents: 0,
    monthlyRevenue: 2800, // Dados fakes conforme solicitado
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
        activeCTs: (ctCount ? ctCount - 2 : 18), // Simulação para dashboard visual
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

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-40 w-full rounded-3xl" /><div className="grid grid-cols-4 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Hero SaaS */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#020617] border border-white/5 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 blur-[120px] rounded-full -mr-20 -mt-20 shrink-0" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/5 px-4 h-8 uppercase font-black italic tracking-widest">
              SaaS Control Center
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
              BjjOss <span className="text-blue-600">Enterprise</span>
            </h1>
            <p className="text-slate-400 max-w-lg font-medium text-lg leading-relaxed">
              O ecossistema está em expansão. Crescimento de <span className="text-green-500 font-bold">85% Mom</span> este mês.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
              <Button className="h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black italic px-8 text-lg gap-2 shadow-xl shadow-blue-500/20">
                <Rocket className="w-5 h-5" /> EXPANDIR REDE
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">MRR Atual</p>
              <p className="text-3xl font-black italic text-white">R$ {stats.monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Conversão</p>
              <p className="text-3xl font-black italic text-green-500">{stats.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Unidades Ativas', value: stats.activeCTs, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Membros Totais', value: stats.totalStudents, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Leads no Funil', value: stats.activeLeads, icon: Target, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Uptime Global', value: '99.9%', icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' }
        ].map((s, idx) => (
          <Card key={idx} className="bg-[#0f172a] border-slate-800 rounded-[32px] overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
            <CardContent className="pt-8">
              <div className={cn("p-3 w-fit rounded-2xl mb-4 transition-transform group-hover:scale-110", s.bg)}>
                <s.icon className={cn("w-6 h-6", s.color)} />
              </div>
              <p className="text-4xl font-black tracking-tighter italic">{s.value}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-[#0f172a] border-slate-800 rounded-[40px] p-8 shadow-2xl">
          <CardHeader className="px-0 pt-0 mb-8">
            <CardTitle className="text-2xl font-black italic uppercase italic flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-xl"><BarChart3 className="w-5 h-5 text-blue-500" /></div>
              Performance SaaS (6 Meses)
            </CardTitle>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="mrr" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lead Funnel Mini */}
        <Card className="bg-[#0f172a] border-slate-800 rounded-[40px] p-8 shadow-2xl">
          <CardHeader className="px-0 pt-0 mb-8">
            <CardTitle className="text-2xl font-black italic uppercase italic">Conversão de Leads</CardTitle>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={12} />
                <Bar dataKey="leads" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {mockChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === mockChartData.length - 1 ? '#2563eb' : '#1e293b'} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between items-center bg-blue-600/5 p-4 rounded-2xl border border-blue-600/10">
            <p className="text-[10px] font-black uppercase text-slate-500">Recorde Mensal</p>
            <p className="text-lg font-black italic text-blue-500">35 Leads Novos</p>
          </div>
        </Card>
      </div>

      {/* Roadmap SaaS 2026 */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 py-1 font-black italic">ROADMAP 2026</Badge>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter italic">Futuro do Ecossistema BjjOss</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {roadmapItems.map((item, idx) => (
            <Card key={idx} className="bg-[#0f172a]/50 border-slate-800 rounded-3xl p-6 group hover:border-blue-500/30 transition-all hover:bg-blue-600/[0.02]">
              <div className="p-3 bg-white/5 rounded-2xl w-fit mb-4 group-hover:bg-blue-600/20 transition-colors">
                <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
              </div>
              <h4 className="font-black uppercase text-xs italic mb-2 leading-tight">{item.title}</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.benefit}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Gerenciar Academias', icon: Building2, to: '/cts' },
          { label: 'Pipeline de Leads', icon: Target, to: '/crm-saas' },
          { label: 'Configurações SaaS', icon: Settings2, to: '/configuracoes' },
          { label: 'Auditoria de Logs', icon: ShieldCheck, to: '/logs' }
        ].map((item, idx) => (
          <ClickableCard key={idx} to={item.to} className="h-32 bg-[#0f172a] border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-3 hover:bg-blue-600/10 transition-all group">
            <item.icon className="w-8 h-8 text-slate-500 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{item.label}</span>
          </ClickableCard>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
