import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import {
    BarChart3,
    Users,
    Settings,
    Calendar,
    GraduationCap,
    Wallet,
    Coffee,
    MessageSquare,
    ShieldCheck,
    LayoutDashboard,
    Eye,
    LogOut,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppSidebar = () => {
    const { role, viewAsRole, setViewAsRole, hasModuleAccess, logout } = useAuth();

    const activeRole = viewAsRole || role;

    const roles: { label: string; value: AppRole | null }[] = [
        { label: 'Visão Original', value: null },
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Admin CT', value: 'admin_ct' },
        { label: 'Professor', value: 'professor' },
        { label: 'Atendente', value: 'atendente' },
        { label: 'Aluno', value: 'aluno' },
    ];

    const menuItems = [
        // Itens de Gestão GLOBAL (Apenas Super Admin)
        { id: 'saas_dashboard', label: 'Visão Geral BjjOss', icon: BarChart3, path: '/dashboard', access: activeRole === 'super_admin' },
        { id: 'cts', label: 'Academia & Professores', icon: Building2, path: '/cts', access: activeRole === 'super_admin' },
        { id: 'leads_saas', label: 'Leads BjjOss', icon: MessageSquare, path: '/crm-saas', access: activeRole === 'super_admin' },

        // Itens Operacionais (CT / Professor) - Escondidos do Super Admin a menos que esteja simulando
        { id: 'dashboard', label: 'Painel CT', icon: LayoutDashboard, path: '/dashboard', access: activeRole !== 'super_admin' },
        { id: 'alunos', label: 'Alunos', icon: Users, path: '/alunos', access: activeRole !== 'super_admin' && hasModuleAccess('alunos') },
        { id: 'turmas', label: 'Turmas', icon: Calendar, path: '/turmas', access: activeRole !== 'super_admin' && hasModuleAccess('turmas') },
        { id: 'presenca', label: 'Presença', icon: ShieldCheck, path: '/presenca', access: activeRole !== 'super_admin' && hasModuleAccess('presenca') },
        { id: 'financeiro', label: 'Financeiro', icon: Wallet, path: '/financeiro', access: activeRole !== 'super_admin' && hasModuleAccess('financeiro') },
        { id: 'cantina', label: 'Cantina', icon: Coffee, path: '/cantina', access: activeRole !== 'super_admin' && hasModuleAccess('cantina') },
        { id: 'crm', label: 'CRM Alunos', icon: BarChart3, path: '/crm', access: activeRole !== 'super_admin' && hasModuleAccess('crm') },
        { id: 'eventos', label: 'Eventos', icon: Calendar, path: '/eventos', access: activeRole !== 'super_admin' && hasModuleAccess('eventos') },
        { id: 'graduacao', label: 'Graduação', icon: GraduationCap, path: '/graduacao', access: activeRole !== 'super_admin' && hasModuleAccess('graduacao') },
        { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare, path: '/comunicacao', access: activeRole !== 'super_admin' && hasModuleAccess('comunicacao') },

        { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/configuracoes', access: true },
    ];

    if (activeRole === 'super_admin') {
        menuItems.push({ id: 'feature-flags', label: 'Configurações Beta', icon: Settings, path: '/feature-flags', access: true });
    }

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40 bg-sidebar-background border-r border-sidebar-border p-4 transition-colors">
            <Link to="/dashboard" className="flex items-center gap-3 px-3 mb-10 group">
                <div className="w-10 h-10 bg-primary/5 rounded flex items-center justify-center border border-primary/20 group-hover:belt-glow transition-all">
                    <span className="text-primary font-black text-xl tracking-tighter uppercase">BO</span>
                </div>
                <div>
                    <h1 className="font-black text-lg tracking-tighter italic uppercase text-foreground leading-none">BjjOss</h1>
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-1 leading-none">Management Pro</p>
                </div>
            </Link>

            <nav className="flex-1 space-y-1">
                {menuItems.filter(item => item.access).map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 group text-sm font-bold uppercase tracking-tight",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <item.icon className={cn("w-4 h-4", "transition-transform group-hover:scale-110")} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto space-y-2 pt-4 border-t border-sidebar-border">
                {role === 'super_admin' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-start gap-3 bg-muted/30 border-sidebar-border text-[10px] font-black uppercase h-9 rounded">
                                <Eye className="w-3.5 h-3.5 text-primary" />
                                <span className="truncate">Ver: {roles.find(r => r.value === viewAsRole)?.label}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-card border-border">
                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground">Simular Perfil</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {roles.map((r) => (
                                <DropdownMenuItem
                                    key={r.label}
                                    className="focus:bg-primary/10 focus:text-primary cursor-pointer text-xs font-bold uppercase"
                                    onClick={() => setViewAsRole(r.value)}
                                >
                                    {r.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <Button
                    variant="ghost"
                    onClick={logout}
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded h-10 px-3 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase">Sair</span>
                </Button>
            </div>
        </aside>
    );
};

export default AppSidebar;
