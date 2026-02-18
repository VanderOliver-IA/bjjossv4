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

  // 1. Detecção Instantânea de Role via Metadados (Opção B - Ultra Resiliente)
  // Isso evita esperar a query do banco para saber qual Dashboard abrir
  const metadataRole = user?.app_metadata?.role as AppRole | undefined;

  // 2. Query de Perfil (Agora em segundo plano, não bloqueia o app)
  const { data: profileQueryData, isLoading: isProfileLoading, refetch } = useQuery({
    queryKey: ['userProfile', user?.id, viewAsRole],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('[AuthContext] Buscando perfil completo...');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('[AuthContext] Erro ao carregar perfil extra (DB 500?), usando fallback');
        return { id: user.id, email: user.email, name: user.user_metadata?.name || 'Usuário' } as UserProfile;
      }
      return data as UserProfile;
    },
    enabled: !!user?.id,
    retry: 1
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
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
    // Usamos o role do metadado como fonte primária ultra-rápida
    const activeRole = viewAsRole || metadataRole;
    if (!activeRole) return false;
    if (activeRole === 'super_admin' || activeRole === 'admin_ct') return true;

    const rolesWithAccess: Record<AppRole, (keyof ModulePermissions)[]> = {
      super_admin: ['alunos', 'turmas', 'presenca', 'crm', 'financeiro', 'cantina', 'eventos', 'graduacao', 'comunicacao', 'relatorios'],
      admin_ct: ['alunos', 'turmas', 'presenca', 'crm', 'financeiro', 'cantina', 'eventos', 'graduacao', 'comunicacao', 'relatorios'],
      professor: ['alunos', 'turmas', 'presenca', 'eventos', 'graduacao', 'comunicacao'],
      atendente: ['alunos', 'crm', 'financeiro', 'cantina', 'comunicacao'],
      aluno: ['cantina', 'eventos', 'comunicacao'],
    };

    return rolesWithAccess[activeRole]?.includes(module) ?? false;
  }, [viewAsRole, metadataRole]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile: profileQueryData || null,
        role: metadataRole || null, // Role vem instantaneamente do login!
        viewAsRole,
        isAuthenticated: !!user,
        // O app NUNCA fica travado se tivermos o user e o role no metadado
        isLoading: !!user && !metadataRole,
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
