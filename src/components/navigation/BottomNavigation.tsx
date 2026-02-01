import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Camera,
  DollarSign,
  ShoppingBag,
  Trophy,
  Award,
  MessageSquare,
  BarChart3,
  Settings,
  Building2,
  Flag,
  FileText,
  UserCircle,
  Receipt,
  Wallet,
  Store,
  UserPlus,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  module?: string;
}

const BottomNavigation = () => {
  const { user, hasModuleAccess } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Navigation items by role
  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case 'super_admin':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'CTs', icon: Building2, path: '/cts' },
          { label: 'Flags', icon: Flag, path: '/feature-flags' },
          { label: 'Auditoria', icon: FileText, path: '/auditoria' },
          { label: 'Financeiro', icon: DollarSign, path: '/financeiro' },
        ];
      case 'admin_ct':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Alunos', icon: Users, path: '/alunos', module: 'alunos' },
          { label: 'Turmas', icon: Calendar, path: '/turmas', module: 'turmas' },
          { label: 'Financeiro', icon: DollarSign, path: '/financeiro', module: 'financeiro' },
          { label: 'Config', icon: Settings, path: '/configuracoes' },
        ];
      case 'professor':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Turmas', icon: Calendar, path: '/turmas', module: 'turmas' },
          { label: 'Alunos', icon: Users, path: '/alunos', module: 'alunos' },
          { label: 'Graduação', icon: Award, path: '/graduacao', module: 'graduacao' },
          { label: 'Mensagens', icon: MessageSquare, path: '/mensagens', module: 'comunicacao' },
        ];
      case 'atendente':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Cantina', icon: ShoppingBag, path: '/cantina', module: 'cantina' },
          { label: 'Lançar', icon: Receipt, path: '/lancamentos', module: 'financeiro' },
          { label: 'Alunos', icon: Users, path: '/alunos', module: 'alunos' },
          { label: 'Caixa', icon: Wallet, path: '/caixa', module: 'financeiro' },
        ];
      case 'aluno':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Perfil', icon: UserCircle, path: '/perfil' },
          { label: 'Frequência', icon: Calendar, path: '/frequencia' },
          { label: 'Extrato', icon: Receipt, path: '/extrato' },
          { label: 'Loja', icon: Store, path: '/loja' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Check if user has presence button (admin_ct, professor, atendente)
  const hasPresenceButton = ['admin_ct', 'professor'].includes(user.role);

  // Filter items based on module access
  const filteredItems = navItems.filter(item => {
    if (!item.module) return true;
    return hasModuleAccess(item.module as any);
  });

  // Split items for presence button placement
  const leftItems = filteredItems.slice(0, 2);
  const rightItems = filteredItems.slice(2, 4);
  const extraItems = filteredItems.slice(4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex items-center justify-around h-16 relative">
          {/* Left Items */}
          {leftItems.map((item) => (
            <NavButton
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
            />
          ))}

          {/* Presence Button (Center) */}
          {hasPresenceButton && (
            <Link
              to="/presenca"
              className="relative -top-4"
            >
              <div className="btn-presence w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg animate-pulse-glow">
                <Camera className="h-6 w-6 text-white" />
                <span className="text-[10px] text-white font-medium mt-0.5">Presença</span>
              </div>
            </Link>
          )}

          {/* Right Items */}
          {rightItems.map((item) => (
            <NavButton
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
            />
          ))}

          {/* Extra Item (if exists) */}
          {extraItems.length > 0 && (
            <NavButton
              item={extraItems[0]}
              isActive={location.pathname === extraItems[0].path}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
}

const NavButton = ({ item, isActive }: NavButtonProps) => {
  const Icon = item.icon;
  
  return (
    <Link
      to={item.path}
      className={cn(
        "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
      <span className={cn(
        "text-[10px] mt-1",
        isActive ? "font-medium text-primary" : "text-muted-foreground"
      )}>
        {item.label}
      </span>
    </Link>
  );
};

export default BottomNavigation;
