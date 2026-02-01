import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Flag, TrendingUp, AlertCircle } from 'lucide-react';
import { mockCTs, mockFeatureFlags } from '@/data/mockData';

const SuperAdminDashboard = () => {
  const activeCTs = mockCTs.filter(ct => ct.subscriptionStatus === 'ativo').length;
  const totalRevenue = 45600; // Mock revenue
  const activeFlags = mockFeatureFlags.filter(f => f.enabled).length;

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
              {mockCTs.length} total registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">
              +12% desde o mês passado
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
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Flags</CardTitle>
            <Flag className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFlags}/{mockFeatureFlags.length}</div>
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
              Crescimento por CT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCTs.map(ct => (
                <div key={ct.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{ct.name}</p>
                    <p className="text-sm text-muted-foreground">{ct.subscription}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-500">+15%</p>
                    <p className="text-xs text-muted-foreground">este mês</p>
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
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">2 CTs com pagamento pendente</p>
                  <p className="text-xs text-muted-foreground">Verificar assinaturas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Flag className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Nova feature disponível</p>
                  <p className="text-xs text-muted-foreground">Integração Pix aguardando ativação</p>
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
