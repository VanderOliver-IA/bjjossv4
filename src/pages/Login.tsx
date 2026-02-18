import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import logo from '@/assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { login, signUp, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas ou email não verificado');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await signUp(email, password, name);

    if (success) {
      setActiveTab('login');
      setError('');
    }

    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070708] p-4 relative overflow-hidden">
      {/* Animated Background Highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-delay-1000 animate-pulse" />

      <div className="w-full max-w-md space-y-8 relative z-10 transition-all duration-700 animate-in fade-in zoom-in-95">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-neon">
            <span className="text-primary font-black text-4xl">B</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">BJJ OSS <span className="text-primary tracking-normal">MANAGEMENT</span></h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium mt-1">O ecossistema definitivo para o Jiu-Jitsu</p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="bg-[#111114]/60 backdrop-blur-2xl border-white/5 shadow-2xl rounded-[32px] overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="space-y-4 p-8 pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">Começar</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-8 pt-0">
              <TabsContent value="login" className="mt-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/70 font-bold ml-1">Email Profissional</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@exemplo.com"
                      className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary/50 focus:ring-primary/20 transition-all text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password" className="text-white/70 font-bold ml-1">Senha de Acesso</Label>
                      <button type="button" className="text-[10px] uppercase tracking-wider text-primary font-bold hover:underline">Esqueceu?</button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary/50 focus:ring-primary/20 transition-all text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-3 rounded-xl text-center flex items-center justify-center gap-2">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-neon transition-all hover:scale-[1.02] active:scale-95"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {loading ? 'SOLICITANDO...' : 'ACESSAR AGORA'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white/70 font-bold ml-1">Nome do Responsável</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Ex: Mestre Gracie"
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white/70 font-bold ml-1">Email de Contato</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@ct.com"
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white/70 font-bold ml-1">Defina uma Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Segurança mínima 6"
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-neon transition-all hover:scale-[1.02] active:scale-95"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {loading ? 'CONFIGURANDO...' : 'CRIAR MEU ECOSSISTEMA'}
                  </Button>

                  <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-medium">Ao criar conta você aceita nossos termos de uso.</p>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Extended Footer */}
        <div className="flex flex-col items-center gap-6 pt-4">
          <div className="flex gap-4 grayscale opacity-30">
            {/* Simulação de logos de parceiros/meios de pagto se quisesse w-10 */}
          </div>
          <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
            Powered by <span className="text-white">OláMundoDigital</span> &copy; 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
