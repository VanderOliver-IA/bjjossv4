import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  ct_id?: string;
  role?: AppRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: AppRole | null;
  viewAsRole: AppRole | null; // Novo: papel que está sendo visualizado
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasModuleAccess: (module: keyof ModulePermissions) => boolean;
  refreshProfile: () => Promise<void>;
  setViewAsRole: (role: AppRole | null) => void; // Novo: função para alterar a visão
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [viewAsRole, setViewAsRole] = useState<AppRole | null>(null); // Novo estado
  const [isLoading, setIsLoading] = useState(true);
  const [modulePermissions, setModulePermissions] = useState<ModulePermissions | null>(null);
  const { toast } = useToast();

  const fetchLock = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string, activeViewAsRole: AppRole | null = null) => {
    // Bloqueio para evitar chamadas duplicadas simultâneas
    if (fetchLock.current === userId) {
      console.log('[Auth] Busca em progresso, ignorando duplicada para:', userId);
      return null;
    }

    try {
      fetchLock.current = userId;
      console.log('[Auth] Iniciando busca robusta:', userId);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('[Auth] Erro busca perfil:', profileError.message);
        return null;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const userRole = roleData?.role as AppRole | undefined;
      const activeRole = activeViewAsRole || userRole;

      if (profileData?.ct_id && activeRole) {
        const { data: permData } = await supabase
          .from('role_permissions')
          .select('modules')
          .eq('ct_id', profileData.ct_id)
          .eq('role', activeRole)
          .maybeSingle();

        if (permData?.modules) {
          setModulePermissions(permData.modules as unknown as ModulePermissions);
        }
      }

      return { ...profileData, role: userRole } as UserProfile;
    } catch (error) {
      console.error('[Auth] Abort ou Erro em fetchProfile:', error);
      return null;
    } finally {
      // Liberar o bloqueio após um pequeno delay para evitar "throttling"
      setTimeout(() => { fetchLock.current = null; }, 1000);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id, viewAsRole);
      if (profileData) {
        setProfile(profileData);
        setRole(profileData.role || null);
      }
    }
  }, [user, viewAsRole, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const loadUserData = async (u: User, sess: Session) => {
      if (!mounted) return;

      console.log('[Auth] Carregando perfil para usuário logado...');
      setIsLoading(true);
      const profileData = await fetchProfile(u.id);

      if (mounted) {
        if (profileData) {
          setProfile(profileData);
          setRole(profileData.role || null);
          setSession(sess);
          setUser(u);
          console.log('[Auth] Perfil estabelecido com sucesso');
        } else {
          console.warn('[Auth] Falha ao carregar perfil (pode estar vazio ou erro)');
        }
        setIsLoading(false);
      }
    };

    // Apenas uma fonte de verdade para a inicialização
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (initSession?.user && mounted) {
        loadUserData(initSession.user, initSession);
      } else if (mounted) {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        console.log('[Auth] Alteração de estado:', event);

        if (currentSession?.user) {
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            await loadUserData(currentSession.user, currentSession);
          } else {
            setSession(currentSession);
            setUser(currentSession.user);
          }
        } else {
          setProfile(null);
          setRole(null);
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao fazer login',
          description: error.message,
        });
        return false;
      }

      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar conta',
          description: error.message,
        });
        return false;
      }

      if (data.user && !data.session) {
        toast({
          title: 'Verifique seu email',
          description: 'Um link de confirmação foi enviado para seu email.',
        });
      }

      return !!data.user;
    } catch (error) {
      console.error('SignUp error:', error);
      return false;
    }
  }, [toast]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setViewAsRole(null);
    setModulePermissions(null);
  }, []);

  const hasModuleAccess = useCallback((module: keyof ModulePermissions): boolean => {
    // Usar o papel simulado se existir, caso contrário o papel real
    const activeRole = viewAsRole || role;

    if (!activeRole) return false;

    // Super admin real sempre tem acesso a tudo (independente do que está visualizando)
    // MAS para propósitos de teste de interface, se ele estiver "assistindo" como Aluno, 
    // ele deve ver apenas o que o Aluno vê se quisermos fidelidade TOTAL ao teste.
    // O usuário pediu: "ver todas as funcionalidades que estão em cada perfil"
    // Então aqui devemos aplicar as restrições do papel simulado.

    // No entanto, se o papel real for super_admin e o usuário quiser voltar ao seletor, 
    // precisamos garantir que os controles de admin não sumam se eles forem externos aos módulos.

    // Se o papel visualizado for super_admin ou admin_ct, tem acesso total
    if (activeRole === 'super_admin' || activeRole === 'admin_ct') return true;

    // Se houver permissões específicas carregadas (para o papel ativo)
    if (modulePermissions) {
      return modulePermissions[module] ?? false;
    }

    // Permissões padrão por papel
    const defaultPermissions: Record<AppRole, ModulePermissions> = {
      super_admin: { alunos: true, turmas: true, presenca: true, crm: true, financeiro: true, cantina: true, eventos: true, graduacao: true, comunicacao: true, relatorios: true },
      admin_ct: { alunos: true, turmas: true, presenca: true, crm: true, financeiro: true, cantina: true, eventos: true, graduacao: true, comunicacao: true, relatorios: true },
      professor: { alunos: true, turmas: true, presenca: true, crm: false, financeiro: false, cantina: false, eventos: true, graduacao: true, comunicacao: true, relatorios: false },
      atendente: { alunos: true, turmas: false, presenca: false, crm: true, financeiro: true, cantina: true, eventos: false, graduacao: false, comunicacao: true, relatorios: false },
      aluno: { alunos: false, turmas: false, presenca: false, crm: false, financeiro: false, cantina: true, eventos: true, graduacao: false, comunicacao: true, relatorios: false },
    };

    return defaultPermissions[activeRole]?.[module] ?? false;
  }, [role, viewAsRole, modulePermissions]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        viewAsRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        signUp,
        logout,
        hasModuleAccess,
        refreshProfile,
        setViewAsRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
