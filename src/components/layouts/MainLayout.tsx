import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopHeader from '@/components/navigation/TopHeader';
import BottomNavigation from '@/components/navigation/BottomNavigation';

const MainLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <main className="pt-14 pb-20 px-4 max-w-screen-xl mx-auto">
        <div className="py-6">
          <Outlet />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
