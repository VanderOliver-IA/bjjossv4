import { useAuth } from '@/contexts/AuthContext';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import AdminCTDashboard from '@/components/dashboards/AdminCTDashboard';
import ProfessorDashboard from '@/components/dashboards/ProfessorDashboard';
import AtendenteDashboard from '@/components/dashboards/AtendenteDashboard';
import AlunoDashboard from '@/components/dashboards/AlunoDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
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
      return <div>Dashboard não encontrado</div>;
  }
};

export default Dashboard;
