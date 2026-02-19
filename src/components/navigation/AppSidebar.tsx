import React from 'react';
import { NavLink } from 'react-router-dom';
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
        <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40 bg-[#0A0A0B]/80 backdrop-blur-xl border-r border-white/10 text-white p-4">
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <span className="text-primary font-bold text-xl">B</span>
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight">BjjOss</h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">Management Pro</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.filter(item => item.access).map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group",
                            isActive
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", "transition-transform group-hover:scale-110")} />
                        <span className="font-medium text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto space-y-4 pt-4 border-t border-white/10">
                {role === 'super_admin' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-start gap-3 bg-white/5 border-white/10 text-xs h-10 rounded-xl">
                                <Eye className="w-4 h-4 text-primary" />
                                <span>Vendo como: <strong>{roles.find(r => r.value === viewAsRole)?.label}</strong></span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#0E0E10] border-white/10 text-white">
                            <DropdownMenuLabel>Simular Perfil</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            {roles.map((r) => (
                                <DropdownMenuItem
                                    key={r.label}
                                    className="focus:bg-primary/20 focus:text-primary cursor-pointer"
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
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-3 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Sair</span>
                </Button>
            </div>
        </aside>
    );
};

export default AppSidebar;
