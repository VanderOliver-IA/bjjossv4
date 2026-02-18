import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Shield, User, Users, Lock, Mail, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      toast.error('Erro ao entrar', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'super_admin' | 'admin_ct' | 'professor' | 'atendente' | 'aluno') => {
    const demos = {
      super_admin: { email: 'super@bjjoss.com', pass: '123456' },
      admin_ct: { email: 'admin@brasilia.com', pass: '123456' },
      professor: { email: 'prof@brasilia.com', pass: '123456' },
      atendente: { email: 'atendente@brasilia.com', pass: '123456' },
      aluno: { email: 'aluno@brasilia.com', pass: '123456' }
    };

    const creds = demos[role];
    setEmail(creds.email);
    setPassword(creds.pass);

    toast.info(`Iniciando Sessão Demo: ${role.replace('_', ' ').toUpperCase()}`);

    setTimeout(() => {
      signIn(creds.email, creds.pass).catch(err => toast.error(err.message));
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] opacity-20" />

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary via-primary/80 to-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] transform hover:rotate-6 transition-transform duration-500">
            <span className="text-4xl font-black text-black">B</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              BJJ OSS <span className="text-primary not-italic">MANAGEMENT</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] opacity-60">
              O Ecossistema Definitivo para o Jiu-Jitsu
            </p>
          </div>
        </div>

        <Card className="bg-[#0A0A0B]/60 backdrop-blur-3xl border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-8 pb-4">
            <div className="flex bg-white/5 p-1 rounded-2xl mb-6">
              <Button variant="ghost" className="flex-1 bg-primary text-black hover:bg-primary/90 font-bold rounded-xl h-10">Entrar</Button>
              <Button variant="ghost" className="flex-1 text-muted-foreground hover:text-white font-bold rounded-xl h-10">Começar</Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Email Profissional</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 bg-white/[0.03] border-white/10 rounded-2xl focus:border-primary/50 transition-all font-medium text-white placeholder:text-white/10 text-sm"
                    placeholder="exemplo@bjjoss.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Senha de Acesso</Label>
                  <Button variant="link" className="h-auto p-0 text-[9px] font-bold uppercase tracking-wider text-primary hover:text-primary group">
                    Esqueceu?
                  </Button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 bg-white/[0.03] border-white/10 rounded-2xl focus:border-primary/50 transition-all font-medium text-white placeholder:text-white/10 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(var(--primary-rgb),0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Acessar Agora <Zap className="w-4 h-4 fill-black" />
                  </span>
                )}
              </Button>
            </form>

            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Selecione seu Perfil</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('super_admin')}
                  className="col-span-2 h-12 bg-primary/5 border-primary/20 hover:bg-primary hover:text-black hover:border-transparent text-primary font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" /> Super Admin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('admin_ct')}
                  className="h-12 bg-white/5 border-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                >
                  <Shield className="w-4 h-4 mr-2" /> Admin CT
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('professor')}
                  className="h-12 bg-white/5 border-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                >
                  <User className="w-4 h-4 mr-2" /> Professor
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('atendente')}
                  className="h-12 bg-white/5 border-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                >
                  <Users className="w-4 h-4 mr-2" /> Atendente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('aluno')}
                  className="h-12 bg-white/5 border-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                >
                  <User className="w-4 h-4 mr-2" /> Aluno
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
          © 2026 BJJOSS V4 - Premium Management System
        </p>
      </div>
    </div>
  );
};

export default Login;
