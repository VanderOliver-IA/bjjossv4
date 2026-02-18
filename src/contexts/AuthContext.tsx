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
  viewAsRole: AppRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasModuleAccess: (module: keyof ModulePermissions) => boolean;
  refreshProfile: () => Promise<void>;
  setViewAsRole: (role: AppRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [viewAsRole, setViewAsRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modulePermissions, setModulePermissions] = useState<ModulePermissions | null>(null);
  const { toast } = useToast();

  const loadingUserRef = useRef<string | null>(null);

  const fetchProfileData = useCallback(async (uId: string, currentViewAs: AppRole | null) => {
    if (loadingUserRef.current === uId) return null;

    try {
      loadingUserRef.current = uId;
      console.log(`[Auth] Fetching profile for ${uId} at ${new Date().toISOString()}`);

      // Get profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uId)
        .maybeSingle();

      if (profileErr) throw profileErr;

      // Get role
      const { data: roleData, error: roleErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', uId)
        .maybeSingle();

      if (roleErr) throw roleErr;

      const userRole = roleData?.role as AppRole | undefined;
      const activeRole = currentViewAs || userRole;

      // Get permissions if applicable
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
    } catch (err: any) {
      console.error('[Auth] Fetch Profile Error:', err.message);
      return null;
    } finally {
      loadingUserRef.current = null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const data = await fetchProfileData(user.id, viewAsRole);
      if (data) {
        setProfile(data);
        setRole(data.role || null);
      }
    }
  }, [user?.id, viewAsRole, fetchProfileData]);

  // Effect 1: Handle Auth State Changes only
  useEffect(() => {
    let mounted = true;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      if (s) {
        setSession(s);
        setUser(s.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      console.log('[Auth] State Changed:', event);
      setSession(s);
      setUser(s?.user ?? null);
      if (!s) {
        setProfile(null);
        setRole(null);
        setViewAsRole(null);
        setModulePermissions(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Effect 2: Handle Profile Data based on User ID only
  useEffect(() => {
    let mounted = true;

    if (user?.id) {
      const load = async () => {
        setIsLoading(true);
        const data = await fetchProfileData(user.id, viewAsRole);
        if (mounted) {
          if (data) {
            setProfile(data);
            setRole(data.role || null);
            console.log('[Auth] Profile loaded for:', data.email);
          } else {
            console.warn('[Auth] Loaded null profile');
          }
          setIsLoading(false);
        }
      };
      load();
    }

    return () => { mounted = false; };
  }, [user?.id, viewAsRole, fetchProfileData]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao entrar', description: error.message });
        return false;
      }
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: window.location.origin }
      });
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao cadastrar', description: error.message });
        return false;
      }
      return !!data.user;
    } catch (err) {
      console.error('SignUp error:', err);
      return false;
    }
  }, [toast]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const hasModuleAccess = useCallback((module: keyof ModulePermissions): boolean => {
    const activeRole = viewAsRole || role;
    if (!activeRole) return false;
    if (activeRole === 'super_admin' || activeRole === 'admin_ct') return true;
    if (modulePermissions) return modulePermissions[module] ?? false;

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
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
