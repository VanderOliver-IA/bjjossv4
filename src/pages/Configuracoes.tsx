import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth, ModulePermissions, AppRole } from '@/contexts/AuthContext';
import { Sun, Moon, Shield, Building2, Bell, Users, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getAllNavItemsForRole, getPrimaryActionItem, DASHBOARD_ITEM } from '@/config/bottomNav';
import { useBottomNavConfig } from '@/hooks/useBottomNavConfig';

type RolePermissions = Record<'professor' | 'atendente' | 'aluno', ModulePermissions>;

const defaultRolePermissions: RolePermissions = {
  professor: { alunos: true, turmas: true, presenca: true, crm: false, financeiro: false, cantina: false, eventos: true, graduacao: true, comunicacao: true, relatorios: false },
  atendente: { alunos: true, turmas: false, presenca: false, crm: true, financeiro: true, cantina: true, eventos: false, graduacao: false, comunicacao: true, relatorios: false },
  aluno: { alunos: false, turmas: false, presenca: false, crm: false, financeiro: false, cantina: true, eventos: true, graduacao: false, comunicacao: true, relatorios: false },
};

const Configuracoes = () => {
  const { theme, toggleTheme } = useTheme();
  const { role, profile, user, hasModuleAccess } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<RolePermissions>(defaultRolePermissions);
  const [ctData, setCtData] = useState<any>(null);

  const navItemsForRole = useMemo(() => getAllNavItemsForRole(role), [role]);
  const allowedNavOptions = useMemo(() => {
    return navItemsForRole
      .filter((item) => {
        if (!item.module) return true;
        return hasModuleAccess(item.module);
      })
      .filter((item) => item.path !== DASHBOARD_ITEM.path)
      .filter((item) => item.path !== getPrimaryActionItem(role).path);
  }, [navItemsForRole, hasModuleAccess, role]);

  const { config, update, reset, swap } = useBottomNavConfig({ userId: user?.id, role });

  useEffect(() => {
    const loadData = async () => {
      if (!profile?.ct_id) return;

      // Load CT data
      const { data: ct } = await supabase
        .from('cts')
        .select('*')
        .eq('id', profile.ct_id)
        .single();

      if (ct) setCtData(ct);

      // Load role permissions
      const { data: rolePerms } = await supabase
        .from('role_permissions')
        .select('role, modules')
        .eq('ct_id', profile.ct_id);

      if (rolePerms) {
        const perms: RolePermissions = { ...defaultRolePermissions };
        rolePerms.forEach((rp: any) => {
          if (rp.role in perms) {
            perms[rp.role as keyof RolePermissions] = rp.modules as ModulePermissions;
          }
        });
        setPermissions(perms);
      }
    };

    loadData();
  }, [profile?.ct_id]);

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

  const handlePermissionChange = async (roleKey: 'professor' | 'atendente' | 'aluno', module: keyof ModulePermissions, value: boolean) => {
    const newPermissions = {
      ...permissions,
      [roleKey]: {
        ...permissions[roleKey],
        [module]: value,
      },
    };
    setPermissions(newPermissions);

    if (!profile?.ct_id) return;

    const modulesJson = JSON.parse(JSON.stringify(newPermissions[roleKey]));

    // Check if permission exists
    const { data: existing } = await supabase
      .from('role_permissions')
      .select('id')
      .eq('ct_id', profile.ct_id)
      .eq('role', roleKey)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('role_permissions')
        .update({ modules: modulesJson })
        .eq('id', existing.id);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar permissões',
          description: error.message,
        });
      }
    } else {
      const { error } = await supabase
        .from('role_permissions')
        .insert([{
          ct_id: profile.ct_id,
          role: roleKey,
          modules: modulesJson,
        }]);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar permissões',
          description: error.message,
        });
      }
    }
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

      {/* Bottom navigation config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Menu inferior
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Defina os 2 atalhos rápidos do menu inferior. O ícone central é a ação principal do seu perfil.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Atalho (esquerda)</Label>
              <Select
                value={config.leftPath ?? "none"}
                onValueChange={(value) => update({ leftPath: value === "none" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {allowedNavOptions.map((opt) => (
                    <SelectItem key={`left-${opt.path}`} value={opt.path}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Atalho (direita)</Label>
              <Select
                value={config.rightPath ?? "none"}
                onValueChange={(value) => update({ rightPath: value === "none" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {allowedNavOptions.map((opt) => (
                    <SelectItem key={`right-${opt.path}`} value={opt.path}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={swap}>
              Inverter atalhos
            </Button>
            <Button type="button" variant="secondary" onClick={reset}>
              Restaurar padrão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions (Admin CT only) */}
      {role === 'admin_ct' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Controle de Acesso por Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(['professor', 'atendente', 'aluno'] as const).map(roleKey => (
                <div key={roleKey} className="space-y-4">
                  <h4 className="font-medium capitalize flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {roleKey === 'aluno' ? 'Aluno' : roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {modules.map(module => (
                      <div key={module.key} className="flex items-center space-x-2">
                        <Switch
                          id={`${roleKey}-${module.key}`}
                          checked={permissions[roleKey][module.key]}
                          onCheckedChange={(value) => handlePermissionChange(roleKey, module.key, value)}
                        />
                        <Label htmlFor={`${roleKey}-${module.key}`} className="text-sm">
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
              <p className="font-medium">{ctData?.name || 'Carregando...'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">CNPJ</p>
              <p className="font-medium">{ctData?.cnpj || '-'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Endereço</p>
              <p className="font-medium">{ctData?.address || '-'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{ctData?.phone || '-'}</p>
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
