import { useAuth } from '@/contexts/DevAuthContext';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import AdminCTDashboard from '@/components/dashboards/AdminCTDashboard';
import ProfessorDashboard from '@/components/dashboards/ProfessorDashboard';
import AtendenteDashboard from '@/components/dashboards/AtendenteDashboard';
import AlunoDashboard from '@/components/dashboards/AlunoDashboard';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  switch (role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'admin_ct':
      return <AdminCTDashboard />;
    case 'professor':
      return <ProfessorDashboard />;
    case 'atendente':
      return <AtendenteDashboard />;
    case 'aluno':
      return <AlunoDashboard />;
    default:
      return (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold">Dashboard em carregamento...</h2>
          <p className="text-muted-foreground mt-2">Aguarde enquanto carregamos seu perfil.</p>
        </div>
      );
  }
};

export default Dashboard;
