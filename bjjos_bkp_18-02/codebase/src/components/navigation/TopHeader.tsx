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
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-[#0A0A0B]/60 backdrop-blur-xl border-b border-white/5 z-40 transition-all duration-300">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Mobile Logo / Page Title */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-bold text-white tracking-tight">BjjOss</span>
          </Link>
          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Global Management</h2>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications - Premium Style */}
          <button className="relative p-2 text-muted-foreground hover:text-white transition-colors group">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#0A0A0B] group-hover:animate-ping" />
          </button>

          <div className="h-6 w-px bg-white/10 mx-1" />

          {/* User Profile - Premium Style */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-all group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{profile.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">{role ? roleLabels[role] : ''}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all shadow-premium">
                  <User className="h-5 w-5 text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-[#0E0E10] border-white/10 shadow-2xl p-2 rounded-2xl">
              <DropdownMenuLabel className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{profile.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{profile.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem asChild className="focus:bg-primary/20 focus:text-primary p-3 rounded-xl cursor-pointer">
                <Link to="/perfil" className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-white/5 rounded-lg"><User className="h-4 w-4" /></div>
                  <span className="font-medium">Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme} className="focus:bg-primary/20 focus:text-primary p-3 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-white/5 rounded-lg">
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </div>
                  <span className="font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={handleLogout} className="focus:bg-destructive/20 focus:text-destructive p-3 rounded-xl cursor-pointer text-destructive">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-destructive/10 rounded-lg"><LogOut className="h-4 w-4" /></div>
                  <span className="font-medium font-bold">Encerrar Sessão</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
