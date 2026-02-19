import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopHeader from '@/components/navigation/TopHeader';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import AppSidebar from '@/components/navigation/AppSidebar';
import { ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrialBanner } from '@/components/layouts/TrialBanner';

const MainLayout = () => {
  const { isAuthenticated, user, whatsappVerified, viewAsRole, setViewAsRole } = useAuth();

  const isDemo = user?.email ? user.email.includes('demo') : false;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && !isDemo && !whatsappVerified) {
    return <Navigate to={`/verificar-whatsapp?email=${user?.email}&whatsapp=${user?.user_metadata?.whatsapp || ''}`} replace />;
  }

  return (
    <div className="min-h-screen bg-[#070708] text-foreground">
      {/* Sidebar - Desktop Only */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex flex-col lg:pl-64">
        <TrialBanner />
        {/* Simulation Banner */}
        {viewAsRole && (
          <div className="bg-primary/20 backdrop-blur-xl border-b border-primary/30 py-2 px-4 flex items-center justify-between sticky top-0 z-50 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-primary animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Modo de Simulação Ativo: Vendo como <span className="text-primary">{viewAsRole.replace('_', ' ')}</span>
              </p>
            </div>
            <button
              onClick={() => setViewAsRole(null)}
              className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors"
            >
              Encerrar Sessão
            </button>
          </div>
        )}

        {/* Header - Mobile Only or Global if preferred */}
        <TopHeader />

        <main className="flex-1 pt-14 pb-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-screen-2xl mx-auto py-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Nav */}
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
