import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon, Shield, Building2, Bell, Users } from 'lucide-react';
import { defaultRolePermissions } from '@/data/mockData';
import { ModulePermissions } from '@/types';

const Configuracoes = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, rolePermissions, updateRolePermissions } = useAuth();
  const [permissions, setPermissions] = useState(rolePermissions);

  const modules: { key: keyof ModulePermissions; label: string }[] = [
    { key: 'alunos', label: 'Alunos' },
    { key: 'turmas', label: 'Turmas' },
    { key: 'presenca', label: 'Presença' },
    { key: 'crm', label: 'CRM / Leads' },
    { key: 'financeiro', label: 'Financeiro' },
    { key: 'cantina', label: 'Cantina / Loja' },
    { key: 'eventos', label: 'Eventos' },
    { key: 'graduacao', label: 'Graduação' },
    { key: 'comunicacao', label: 'Comunicação' },
    { key: 'relatorios', label: 'Relatórios' },
  ];

  const handlePermissionChange = (role: 'professor' | 'atendente' | 'aluno', module: keyof ModulePermissions, value: boolean) => {
    const newPermissions = {
      ...permissions,
      [role]: {
        ...permissions[role],
        [module]: value,
      },
    };
    setPermissions(newPermissions);
    updateRolePermissions(role, newPermissions[role]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do CT</p>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tema Escuro</p>
              <p className="text-sm text-muted-foreground">Alterne entre tema claro e escuro</p>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions (Admin CT only) */}
      {user?.role === 'admin_ct' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Controle de Acesso por Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(['professor', 'atendente', 'aluno'] as const).map(role => (
                <div key={role} className="space-y-4">
                  <h4 className="font-medium capitalize flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {role === 'aluno' ? 'Aluno' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {modules.map(module => (
                      <div key={module.key} className="flex items-center space-x-2">
                        <Switch
                          id={`${role}-${module.key}`}
                          checked={permissions[role][module.key]}
                          onCheckedChange={(value) => handlePermissionChange(role, module.key, value)}
                        />
                        <Label htmlFor={`${role}-${module.key}`} className="text-sm">
                          {module.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CT Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados do CT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">Gracie Barra Centro</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">CNPJ</p>
              <p className="font-medium">12.345.678/0001-00</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Endereço</p>
              <p className="font-medium">Rua Principal, 123 - Centro</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">(11) 3333-0001</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações por Email</p>
              <p className="text-sm text-muted-foreground">Receba alertas por email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações WhatsApp</p>
              <p className="text-sm text-muted-foreground">Receba alertas via WhatsApp</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
