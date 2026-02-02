import { Outlet } from 'react-router-dom';
import TopHeader from '@/components/navigation/TopHeader';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import DevProfileSwitcher from '@/components/dev/DevProfileSwitcher';

const DevMainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <DevProfileSwitcher />
      <div className="pt-10"> {/* Extra padding for dev switcher */}
        <TopHeader />
        <main className="pt-14 pb-20 px-4 max-w-screen-xl mx-auto">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
};

export default DevMainLayout;
