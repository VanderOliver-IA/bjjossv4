import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type AppRole = 'super_admin' | 'admin_ct' | 'professor' | 'atendente' | 'aluno';

export interface ModulePermissions {
  alunos: boolean;
  turmas: boolean;
  presenca: boolean;
  crm: boolean;
  financeiro: boolean;
  cantina: boolean;
  eventos: boolean;
  graduacao: boolean;
  comunicacao: boolean;
  relatorios: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  ct_id?: string;
  role?: AppRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: AppRole | null;
  viewAsRole: AppRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasModuleAccess: (module: keyof ModulePermissions) => boolean;
  refreshProfile: () => void;
  setViewAsRole: (role: AppRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [viewAsRole, setViewAsRole] = useState<AppRole | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. O CORAÇÃO DA SOLUÇÃO: TanStack Query para carregar o perfil
  // Remove 100% da necessidade de useEffects manuais e evita AbortError automaticamente
  const { data: profileData, isLoading: isProfileLoading, refetch } = useQuery({
    queryKey: ['userProfile', user?.id, viewAsRole],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('[AuthQuery] Buscando perfil para:', user.id);

      // Buscar Perfil
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (pErr) throw pErr;

      // Buscar Role
      const { data: roleRec } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      const userRole = roleRec?.role as AppRole;
      return { ...profile, role: userRole } as UserProfile;
    },
    enabled: !!user?.id, // Só roda se tiver usuário logado
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    retry: 2
  });

  // 2. Listener de Sessão do Supabase (Minimalista)
  useEffect(() => {
    // Pegar sessão inicial
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      console.log('[Auth] Inicializando sessão...');
      setSession(s);
      setUser(s?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      console.log('[Auth] Evento Supabase:', event);
      setSession(s);
      setUser(s?.user ?? null);

      if (event === 'SIGNED_OUT') {
        queryClient.clear(); // Limpa todo o cache no logout
        setViewAsRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro de Login', description: error.message });
      return false;
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const hasModuleAccess = useCallback((module: keyof ModulePermissions): boolean => {
    const activeRole = viewAsRole || profileData?.role;
    if (!activeRole) return false;
    if (activeRole === 'super_admin' || activeRole === 'admin_ct') return true;

    // Fallback para permissões simples baseadas no role
    const rolesWithAccess: Record<AppRole, (keyof ModulePermissions)[]> = {
      super_admin: ['alunos', 'turmas', 'presenca', 'crm', 'financeiro', 'cantina', 'eventos', 'graduacao', 'comunicacao', 'relatorios'],
      admin_ct: ['alunos', 'turmas', 'presenca', 'crm', 'financeiro', 'cantina', 'eventos', 'graduacao', 'comunicacao', 'relatorios'],
      professor: ['alunos', 'turmas', 'presenca', 'eventos', 'graduacao', 'comunicacao'],
      atendente: ['alunos', 'crm', 'financeiro', 'cantina', 'comunicacao'],
      aluno: ['cantina', 'eventos', 'comunicacao'],
    };

    return rolesWithAccess[activeRole]?.includes(module) ?? false;
  }, [viewAsRole, profileData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile: profileData || null,
        role: profileData?.role || null,
        viewAsRole,
        isAuthenticated: !!user,
        isLoading: isProfileLoading && !!user, // Só mostra carregando se tiver usuário mas o perfil ainda não chegou
        login,
        logout,
        hasModuleAccess,
        refreshProfile: () => refetch(),
        setViewAsRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
