import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Smartphone,
  Shield,
  Save,
  Loader2,
  Camera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Perfil() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        whatsapp: profile.whatsapp || '',
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    console.log('[Perfil] Tentando salvar:', formData);

    try {
      // 1. Atualizar Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          whatsapp: formData.whatsapp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Atualizar Auth Metadata (para consistência)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          whatsapp: formData.whatsapp
        }
      });

      if (authError) throw authError;

      toast({
        title: "✅ Sucesso!",
        description: "Seus dados foram atualizados com sucesso.",
      });

      refreshProfile();
    } catch (err: any) {
      console.error('[Perfil] Erro ao salvar:', err);
      toast({
        variant: "destructive",
        title: "❌ Erro ao salvar",
        description: err.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-[#0f172a] p-8 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl" />

        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center font-black text-3xl italic border-4 border-[#0f172a] shadow-xl">
            {formData.name.charAt(0)}
          </div>
          <button className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl border-2 border-[#0f172a] hover:scale-110 transition-transform shadow-lg">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <h1 className="text-3xl font-black tracking-tighter italic uppercase">{formData.name || 'Seu Nome'}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold uppercase text-[10px]">
              {profile?.role?.replace('_', ' ') || 'Carregando...'}
            </Badge>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 font-bold uppercase text-[10px]">
              <CheckCircle2 className="w-3 h-3 mr-1" /> WhatsApp Verificado
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Form */}
        <Card className="md:col-span-2 bg-[#0f172a] border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-slate-800/50 pb-6 px-8 pt-8">
            <CardTitle className="text-xl font-black italic uppercase tracking-tight">Dados Pessoais</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Mantenha suas informações de contato atualizadas</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black uppercase text-[10px] tracking-widest ml-1">Nome Completo</Label>
                <div className="relative">
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-[#1e293b] border-slate-800 h-14 rounded-2xl pl-12 focus:border-blue-500/50"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black uppercase text-[10px] tracking-widest ml-1">Email (Somente leitura)</Label>
                  <div className="relative opacity-50">
                    <Input
                      value={formData.email}
                      disabled
                      className="bg-[#1e293b] border-slate-800 h-14 rounded-2xl pl-12 cursor-not-allowed"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400 font-black uppercase text-[10px] tracking-widest ml-1">WhatsApp</Label>
                  <div className="relative">
                    <Input
                      value={formData.whatsapp}
                      onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="bg-[#1e293b] border-slate-800 h-14 rounded-2xl pl-12 focus:border-blue-500/50"
                    />
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl px-12 font-black italic tracking-tight shadow-xl shadow-blue-500/20 gap-2 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                  <>
                    <Save className="w-5 h-5" />
                    SALVAR ALTERAÇÕES
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security / Info Sidebar */}
        <div className="space-y-6">
          <Card className="bg-[#0f172a] border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status da Conta</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-bold">Ativa e Verificada</p>
                </div>
              </div>
              <Button variant="outline" className="w-full border-slate-800 h-10 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                Alterar Senha
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-600/5 border-blue-500/20 rounded-[32px] overflow-hidden shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-blue-400">Dica de Gestão</p>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Sincronizar seu WhatsApp garante que o sistema possa te enviar alertas críticos e notificações financeiras em tempo real.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
