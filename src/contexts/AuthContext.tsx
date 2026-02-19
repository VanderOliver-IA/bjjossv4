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
  whatsapp?: string;
  whatsapp_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: AppRole | null;
  viewAsRole: AppRole | null;
  viewAsCT: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasModuleAccess: (module: keyof ModulePermissions) => boolean;
  refreshProfile: () => void;
  setViewAsRole: (role: AppRole | null) => void;
  setViewAsCT: (ctId: string | null) => Promise<void>;
  demoSessionId: string | null;
  whatsappVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [viewAsRole, setViewAsRole] = useState<AppRole | null>(null);
  const [viewAsCT, setViewAsCT] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const metadataRole = user?.app_metadata?.role as AppRole | undefined;

  const { data: profileQueryData, isLoading: isProfileLoading, refetch } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (error) return { id: user.id, email: user.email, name: user.user_metadata?.name || 'Usuário' } as UserProfile;
      return data as UserProfile;
    },
    enabled: !!user?.id,
    retry: 1
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user?.user_metadata?.view_as_ct) {
        setViewAsCT(s.user.user_metadata.view_as_ct);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
        setViewAsRole(null);
        setViewAsCT(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const setViewAsCTProxy = async (ctId: string | null) => {
    setViewAsCT(ctId);
    // CRÍTICO: Atualiza metadado do Auth para as RLS de Super Admin funcionarem
    // pois as RLS lêem direto do JWT (User Metadata)
    if (user) {
      await supabase.auth.updateUser({
        data: { view_as_ct: ctId }
      });
      toast({ title: ctId ? 'Modo Suporte Ativado' : 'Acesso Global Ativado', description: 'Visão do sistema atualizada.' });
    }
  };

  const [demoSessionId, setDemoSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.email && user.email.includes('demo')) {
      const existing = localStorage.getItem('bjjoss_demo_session');
      if (existing) setDemoSessionId(existing);
      else {
        const newId = crypto.randomUUID();
        localStorage.setItem('bjjoss_demo_session', newId);
        setDemoSessionId(newId);
      }
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro de Login', description: error.message });
      return false;
    }
    return true;
  };

  const logout = async () => {
    if (demoSessionId) {
      await supabase.rpc('cleanup_demo_session', { session_id: demoSessionId });
      localStorage.removeItem('bjjoss_demo_session');
    }
    await supabase.auth.signOut();
    queryClient.clear();
  };

  const hasModuleAccess = useCallback((module: keyof ModulePermissions): boolean => {
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
        role: metadataRole || null,
        viewAsRole,
        isAuthenticated: !!user,
        isLoading: !!user && !metadataRole,
        login,
        logout,
        hasModuleAccess,
        refreshProfile: () => refetch(),
        setViewAsRole,
        setViewAsCT: setViewAsCTProxy,
        demoSessionId,
        viewAsCT,
        whatsappVerified: profileQueryData?.whatsapp_verified || false,
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
