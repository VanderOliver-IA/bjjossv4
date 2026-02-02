import React, { createContext, useContext, useState, useCallback } from 'react';

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

// Mock profiles for each role
const mockProfiles: Record<AppRole, UserProfile> = {
  super_admin: {
    id: 'dev-super-admin',
    user_id: 'dev-super-admin-user',
    name: 'Super Administrador',
    email: 'super@bjjoss.com',
    phone: '(11) 99999-0001',
    ct_id: 'dev-ct-001',
    role: 'super_admin',
  },
  admin_ct: {
    id: 'dev-admin-ct',
    user_id: 'dev-admin-ct-user',
    name: 'Admin do CT',
    email: 'admin@bjjoss.com',
    phone: '(11) 99999-0002',
    ct_id: 'dev-ct-001',
    role: 'admin_ct',
  },
  professor: {
    id: 'dev-professor',
    user_id: 'dev-professor-user',
    name: 'Professor Silva',
    email: 'professor@bjjoss.com',
    phone: '(11) 99999-0003',
    ct_id: 'dev-ct-001',
    role: 'professor',
  },
  atendente: {
    id: 'dev-atendente',
    user_id: 'dev-atendente-user',
    name: 'Maria Atendente',
    email: 'atendente@bjjoss.com',
    phone: '(11) 99999-0004',
    ct_id: 'dev-ct-001',
    role: 'atendente',
  },
  aluno: {
    id: 'dev-aluno',
    user_id: 'dev-aluno-user',
    name: 'João Aluno',
    email: 'aluno@bjjoss.com',
    phone: '(11) 99999-0005',
    ct_id: 'dev-ct-001',
    role: 'aluno',
  },
};

// Default permissions by role
const defaultPermissions: Record<AppRole, ModulePermissions> = {
  super_admin: { 
    alunos: true, turmas: true, presenca: true, crm: true, 
    financeiro: true, cantina: true, eventos: true, graduacao: true, 
    comunicacao: true, relatorios: true 
  },
  admin_ct: { 
    alunos: true, turmas: true, presenca: true, crm: true, 
    financeiro: true, cantina: true, eventos: true, graduacao: true, 
    comunicacao: true, relatorios: true 
  },
  professor: { 
    alunos: true, turmas: true, presenca: true, crm: false, 
    financeiro: false, cantina: false, eventos: true, graduacao: true, 
    comunicacao: true, relatorios: false 
  },
  atendente: { 
    alunos: true, turmas: false, presenca: false, crm: true, 
    financeiro: true, cantina: true, eventos: false, graduacao: false, 
    comunicacao: true, relatorios: false 
  },
  aluno: { 
    alunos: false, turmas: false, presenca: false, crm: false, 
    financeiro: false, cantina: true, eventos: true, graduacao: false, 
    comunicacao: true, relatorios: false 
  },
};

interface DevAuthContextType {
  user: null;
  session: null;
  profile: UserProfile | null;
  role: AppRole | null;
  currentRole: AppRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasModuleAccess: (module: keyof ModulePermissions) => boolean;
  refreshProfile: () => Promise<void>;
  switchRole: (role: AppRole) => void;
}

const DevAuthContext = createContext<DevAuthContextType | undefined>(undefined);

export function DevAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<AppRole>('super_admin');

  const profile = mockProfiles[currentRole];
  const role = currentRole;

  const switchRole = useCallback((newRole: AppRole) => {
    setCurrentRole(newRole);
  }, []);

  const login = useCallback(async (): Promise<boolean> => {
    return true;
  }, []);

  const signUp = useCallback(async (): Promise<boolean> => {
    return true;
  }, []);

  const logout = useCallback(async () => {
    // No-op in dev mode
  }, []);

  const hasModuleAccess = useCallback((module: keyof ModulePermissions): boolean => {
    return defaultPermissions[currentRole]?.[module] ?? false;
  }, [currentRole]);

  const refreshProfile = useCallback(async () => {
    // No-op in dev mode
  }, []);

  return (
    <DevAuthContext.Provider
      value={{
        user: null,
        session: null,
        profile,
        role,
        currentRole,
        isAuthenticated: true, // Always authenticated in dev mode
        isLoading: false,
        login,
        signUp,
        logout,
        hasModuleAccess,
        refreshProfile,
        switchRole,
      }}
    >
      {children}
    </DevAuthContext.Provider>
  );
}

export function useDevAuth() {
  const context = useContext(DevAuthContext);
  if (context === undefined) {
    throw new Error('useDevAuth must be used within a DevAuthProvider');
  }
  return context;
}

// Re-export useAuth as alias for compatibility
export function useAuth() {
  return useDevAuth();
}
