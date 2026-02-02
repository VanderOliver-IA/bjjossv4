import { useDevAuth } from '@/contexts/DevAuthContext';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Building2, 
  GraduationCap, 
  Headphones, 
  User,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const profiles = [
  { role: 'super_admin', label: 'Super Admin', icon: Crown, color: 'text-yellow-500' },
  { role: 'admin_ct', label: 'Admin CT', icon: Building2, color: 'text-blue-500' },
  { role: 'professor', label: 'Professor', icon: GraduationCap, color: 'text-green-500' },
  { role: 'atendente', label: 'Atendente', icon: Headphones, color: 'text-purple-500' },
  { role: 'aluno', label: 'Aluno', icon: User, color: 'text-orange-500' },
] as const;

const DevProfileSwitcher = () => {
  const { currentRole, switchRole } = useDevAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive/10 border-b-2 border-destructive">
      <div className="max-w-screen-xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">Modo Dev - Login Desativado</span>
          </div>
          
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {profiles.map(({ role, label, icon: Icon, color }) => (
              <Button
                key={role}
                variant={currentRole === role ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchRole(role)}
                className={cn(
                  'h-8 text-xs gap-1.5',
                  currentRole === role 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', currentRole !== role && color)} />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevProfileSwitcher;
