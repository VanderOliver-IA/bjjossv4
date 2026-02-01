import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '@/assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas');
    }
    
    setLoading(false);
  };

  const testCredentials = [
    { role: 'Super Admin', email: 'superadmin@bjjoss.com' },
    { role: 'Admin CT', email: 'admin@academia.com' },
    { role: 'Professor', email: 'professor@academia.com' },
    { role: 'Atendente', email: 'atendente@academia.com' },
    { role: 'Aluno', email: 'aluno@email.com' },
  ];

  const fillCredentials = (email: string) => {
    setEmail(email);
    setPassword('test123');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <img src={logo} alt="BJJ OSS" className="h-32 w-auto mb-4" />
          <p className="text-muted-foreground text-sm">Organização de Centro de Treinamento</p>
        </div>

        {/* Login Card */}
        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-destructive text-sm text-center">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full btn-presence text-white font-semibold"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Test Credentials */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Usuários de teste (senha: test123)
              </p>
              <div className="grid gap-2">
                {testCredentials.map((cred) => (
                  <button
                    key={cred.email}
                    onClick={() => fillCredentials(cred.email)}
                    className="text-xs text-left px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <span className="font-medium text-foreground">{cred.role}:</span>{' '}
                    <span className="text-muted-foreground">{cred.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Desenvolvido por <span className="font-medium">OláMundoDigital</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
