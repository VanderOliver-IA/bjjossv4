import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp, AlertTriangle, UserCheck, Clock, UserPlus } from 'lucide-react';
import { mockStudents, mockAttendance, mockTransactions, mockLeads, getDashboardStats } from '@/data/mockData';

const AdminCTDashboard = () => {
  const stats = getDashboardStats();
  const recentAttendance = mockAttendance.slice(0, 3);
  const pendingPayments = mockTransactions.filter(t => t.status === 'atrasado');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Gracie Barra Centro - Visão geral</p>
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
              de {mockStudents.length} matriculados
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
            <TrendingUp className="h-4 w-4 text-green-500" />
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

        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(stats.monthlyRevenue / 1000).toFixed(1)}k</p>
                <p className="text-xs text-muted-foreground">Receita do Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
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
                <p className="text-2xl font-bold">5</p>
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
              {recentAttendance.map(att => (
                <div key={att.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{att.className}</p>
                    <p className="text-sm text-muted-foreground">{att.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{att.studentIds.length}</p>
                    <p className="text-xs text-muted-foreground">presentes</p>
                  </div>
                </div>
              ))}
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
              {pendingPayments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div>
                    <p className="font-medium">{payment.studentName}</p>
                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-destructive">R$ {payment.amount}</p>
                    <p className="text-xs text-muted-foreground">Venc: {payment.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCTDashboard;
