import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, LogOut, User, Bell } from 'lucide-react';
import logo from '@/assets/logo.png';

const TopHeader = () => {
  const { profile, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!profile) return null;

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin_ct: 'Admin CT',
    professor: 'Professor',
    atendente: 'Atendente',
    aluno: 'Aluno',
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 transition-all duration-300">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Mobile Logo / Page Title */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs uppercase tracking-tighter">BO</span>
            </div>
            <span className="font-bold text-foreground tracking-tight">BjjOss</span>
          </Link>
          <div className="hidden lg:block">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{role ? roleLabels[role] : 'DASHBOARD'}</h2>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Notifications - Minimalist */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors group">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-belt-orange rounded-full" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* User Profile - Sharp & Clean */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-muted/50 transition-all group">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{profile.name.split(' ')[0]}</p>
                </div>
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center border border-border group-hover:border-primary/50 transition-all">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl p-1 rounded-lg">
              <DropdownMenuLabel className="p-3">
                <p className="font-bold text-sm">{profile.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{profile.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="p-2 gap-3 cursor-pointer">
                <Link to="/perfil" className="flex items-center gap-3 w-full">
                  <User className="h-3.5 w-3.5" />
                  <span className="text-sm">Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="p-2 gap-3 cursor-pointer text-destructive">
                <LogOut className="h-3.5 w-3.5" />
                <span className="text-sm font-bold">Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
