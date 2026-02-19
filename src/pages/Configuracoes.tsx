import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth, ModulePermissions } from '@/contexts/AuthContext';
import { Sun, Moon, Shield, Building2, Bell, Users, Navigation, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllNavItemsForRole, getPrimaryActionItem, DASHBOARD_ITEM } from '@/config/bottomNav';
import { useBottomNavConfig } from '@/hooks/useBottomNavConfig';
import { SupportRequestDialog } from '@/components/support/SupportRequestDialog';

type RolePermissions = Record<'professor' | 'atendente' | 'aluno', ModulePermissions>;

const defaultRolePermissions: RolePermissions = {
  professor: { alunos: true, turmas: true, presenca: true, crm: false, financeiro: false, cantina: false, eventos: true, graduation: true, graduacao: true, comunicacao: true, relatorios: false } as any,
  atendente: { alunos: true, turmas: false, presenca: false, crm: true, financeiro: true, cantina: true, eventos: false, graduation: false, graduacao: false, comunicacao: true, relatorios: false } as any,
  aluno: { alunos: false, turmas: false, presenca: false, crm: false, financeiro: false, cantina: true, eventos: true, graduation: false, graduacao: false, comunicacao: true, relatorios: false } as any,
};

const Configuracoes = () => {
  const { theme, toggleTheme } = useTheme();
  const { role, profile, user, hasModuleAccess } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<RolePermissions>(defaultRolePermissions);
  const [ctData, setCtData] = useState<any>(null);
  const [saasConfig, setSaasConfig] = useState<Record<string, string>>({});
  const [savingSaaS, setSavingSaaS] = useState(false);

  const navItemsForRole = useMemo(() => getAllNavItemsForRole(role), [role]);
  const allowedNavOptions = useMemo(() => {
    return navItemsForRole
      .filter((item) => {
        if (!item.module) return true;
        return hasModuleAccess(item.module as any);
      })
      .filter((item) => item.path !== DASHBOARD_ITEM.path)
      .filter((item) => item.path !== getPrimaryActionItem(role).path);
  }, [navItemsForRole, hasModuleAccess, role]);

  const { config, update, reset, swap } = useBottomNavConfig({ userId: user?.id, role });

  useEffect(() => {
    const loadData = async () => {
      // 1. Dados do CT
      if (profile?.ct_id) {
        const { data: ct } = await supabase.from('cts').select('*').eq('id', profile.ct_id).single();
        if (ct) setCtData(ct);

        const { data: rolePerms } = await supabase.from('role_permissions').select('role, modules').eq('ct_id', profile.ct_id);
        if (rolePerms) {
          const perms: RolePermissions = { ...defaultRolePermissions };
          rolePerms.forEach((rp: any) => {
            if (rp.role in perms) {
              perms[rp.role as keyof RolePermissions] = rp.modules as ModulePermissions;
            }
          });
          setPermissions(perms);
        }
      }

      // 2. Configurações Globais (Super Admin)
      if (role === 'super_admin') {
        const { data: configs } = await supabase.from('saas_config').select('*');
        if (configs) {
          const configMap: Record<string, string> = {};
          configs.forEach(c => configMap[c.key] = c.value);
          setSaasConfig(configMap);
        }
      }
    };

    loadData();
  }, [profile?.ct_id, role]);

  const handleUpdateSaaS = async () => {
    setSavingSaaS(true);
    try {
      for (const [key, value] of Object.entries(saasConfig)) {
        await supabase.from('saas_config').update({ value }).eq('key', key);
      }
      toast({ title: 'Configurações SaaS salvas', description: 'Sistema atualizado com sucesso.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message });
    } finally {
      setSavingSaaS(false);
    }
  };

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
      [roleKey]: { ...permissions[roleKey], [module]: value },
    };
    setPermissions(newPermissions);

    if (!profile?.ct_id) return;
    const modulesJson = JSON.parse(JSON.stringify(newPermissions[roleKey]));

    const { data: existing } = await supabase.from('role_permissions').select('id').eq('ct_id', profile.ct_id).eq('role', roleKey).single();

    if (existing) {
      await supabase.from('role_permissions').update({ modules: modulesJson }).eq('id', existing.id);
    } else {
      await supabase.from('role_permissions').insert([{ ct_id: profile.ct_id, role: roleKey, modules: modulesJson }]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do seu tatame</p>
        </div>
        {(role === 'admin_ct' || role === 'professor' || role === 'super_admin') && (
          <SupportRequestDialog />
        )}
      </div>

      {role !== 'super_admin' && (
        <Card className="border-blue-500/20 bg-blue-500/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500"><Shield className="w-6 h-6" /></div>
              <div className="space-y-1">
                <p className="font-bold text-sm">Privacidade e Transparência (LGPD)</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sua segurança é nossa prioridade. Todo acesso é logado e auditado conforme a LGPD.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">{theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} Aparência</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Tema Escuro</p><p className="text-sm text-muted-foreground">Alterne entre tema claro e escuro</p></div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {role !== 'super_admin' && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Navigation className="h-5 w-5" /> Menu inferior</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Atalho (esquerda)</Label>
                  <Select value={config.leftPath ?? "none"} onValueChange={(value) => update({ leftPath: value === "none" ? null : value })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {allowedNavOptions.map((opt) => <SelectItem key={`left-${opt.path}`} value={opt.path}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Atalho (direita)</Label>
                  <Select value={config.rightPath ?? "none"} onValueChange={(value) => update({ rightPath: value === "none" ? null : value })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {allowedNavOptions.map((opt) => <SelectItem key={`right-${opt.path}`} value={opt.path}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={swap}>Inverter</Button>
                <Button type="button" variant="secondary" onClick={reset}>Padrão</Button>
              </div>
            </CardContent>
          </Card>

          {role === 'admin_ct' && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Controle de Perfil</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(['professor', 'atendente', 'aluno'] as const).map(roleKey => (
                    <div key={roleKey} className="space-y-4">
                      <h4 className="font-medium capitalize flex items-center gap-2"><Users className="h-4 w-4" /> {roleKey}</h4>
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {modules.map(module => (
                          <div key={module.key} className="flex items-center space-x-2">
                            <Switch id={`${roleKey}-${module.key}`} checked={permissions[roleKey][module.key]} onCheckedChange={(value) => handlePermissionChange(roleKey, module.key, value)} />
                            <Label htmlFor={`${roleKey}-${module.key}`} className="text-sm">{module.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {role === 'super_admin' && (
        <Card className="border-blue-500/40 shadow-xl shadow-blue-500/10">
          <CardHeader><CardTitle className="flex items-center gap-2 text-blue-500"><Sparkles className="h-5 w-5" /> Global SaaS Settings</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>N8N WhatsApp Webhook URL</Label>
                <Input value={saasConfig['n8n_whatsapp_webhook_url'] || ''} onChange={e => setSaasConfig(prev => ({ ...prev, n8n_whatsapp_webhook_url: e.target.value }))} className="bg-muted" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>TTL Código (Min)</Label>
                  <Input type="number" value={saasConfig['verification_code_ttl_minutes'] || ''} onChange={e => setSaasConfig(prev => ({ ...prev, verification_code_ttl_minutes: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Limite Envios/Hora</Label>
                  <Input type="number" value={saasConfig['verification_rate_limit_per_hour'] || ''} onChange={e => setSaasConfig(prev => ({ ...prev, verification_rate_limit_per_hour: e.target.value }))} />
                </div>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-500 font-bold" onClick={handleUpdateSaaS} disabled={savingSaaS}>
              {savingSaaS ? <Loader2 className="animate-spin mr-2" /> : 'Salvar Configurações SaaS'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Configuracoes;
