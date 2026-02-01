import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, RolePermissions, ModulePermissions } from '@/types';
import { mockUsers, defaultRolePermissions } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  rolePermissions: RolePermissions;
  updateRolePermissions: (role: keyof RolePermissions, permissions: ModulePermissions) => void;
  hasModuleAccess: (module: keyof ModulePermissions) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated credentials
const credentials: Record<string, { email: string; password: string }> = {
  super_admin: { email: 'superadmin@bjjoss.com', password: 'test123' },
  admin_ct: { email: 'admin@academia.com', password: 'test123' },
  professor: { email: 'professor@academia.com', password: 'test123' },
  atendente: { email: 'atendente@academia.com', password: 'test123' },
  aluno: { email: 'aluno@email.com', password: 'test123' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(defaultRolePermissions);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find matching credentials
    const matchingRole = Object.entries(credentials).find(
      ([_, cred]) => cred.email === email && cred.password === password
    );

    if (matchingRole) {
      const foundUser = mockUsers.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        return true;
      }
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateRolePermissions = useCallback((role: keyof RolePermissions, permissions: ModulePermissions) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: permissions,
    }));
  }, []);

  const hasModuleAccess = useCallback((module: keyof ModulePermissions): boolean => {
    if (!user) return false;
    
    // Super admin and admin_ct have access to everything
    if (user.role === 'super_admin' || user.role === 'admin_ct') return true;
    
    // Check role-specific permissions
    const role = user.role as keyof RolePermissions;
    if (role in rolePermissions) {
      return rolePermissions[role][module];
    }
    
    return false;
  }, [user, rolePermissions]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        rolePermissions,
        updateRolePermissions,
        hasModuleAccess,
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
