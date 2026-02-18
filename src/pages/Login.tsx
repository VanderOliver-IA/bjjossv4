import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Shield, ShieldAlert, User, Users, Lock, Mail } from 'lucide-react';
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

    toast.info(`Preenchendo acesso demo: ${role.replace('_', ' ')}...`);

    // Pequeno delay para efeito visual de preenchimento
    setTimeout(() => {
      signIn(creds.email, creds.pass).catch(err => toast.error(err.message));
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-[#0A0A0B] to-[#0A0A0B]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-20 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] opacity-20" />

      <Card className="w-full max-w-md bg-[#111114]/80 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-neon mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter text-white">
            <span className="text-primary">Bjj</span>Oss
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Acesse sua conta para gerenciar seu CT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 transition-all font-medium text-white placeholder:text-white/20"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 transition-all font-medium text-white placeholder:text-white/20"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-wide rounded-xl shadow-neon transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar na Plataforma'}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#111114]/80 px-4 text-muted-foreground font-bold tracking-widest backdrop-blur-sm">Acesso Rápido (Demo)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('super_admin')}
              className="col-span-2 h-10 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:text-primary text-primary/80 font-bold text-xs uppercase tracking-wider"
            >
              <ShieldAlert className="w-4 h-4 mr-2" /> Super Admin
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('admin_ct')}
              className="h-10 border-white/5 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-bold text-xs uppercase tracking-wider"
            >
              <Shield className="w-4 h-4 mr-2" /> Admin CT
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('professor')}
              className="h-10 border-white/5 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-bold text-xs uppercase tracking-wider"
            >
              <User className="w-4 h-4 mr-2" /> Professor
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('atendente')}
              className="h-10 border-white/5 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-bold text-xs uppercase tracking-wider"
            >
              <Users className="w-4 h-4 mr-2" /> Atendente
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('aluno')}
              className="h-10 border-white/5 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-bold text-xs uppercase tracking-wider"
            >
              <User className="w-4 h-4 mr-2" /> Aluno
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-8 pt-0">
          <Button variant="link" className="text-white/40 hover:text-white text-xs">Esqueceu a senha?</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
