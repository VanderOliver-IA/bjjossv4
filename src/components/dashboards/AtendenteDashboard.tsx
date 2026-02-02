import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, DollarSign, Users, TrendingUp, Clock, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/DevAuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: string;
  payment_method: string;
  created_at: string;
}

const AtendenteDashboard = () => {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    currentBalance: 0,
    todaySales: 0,
    todayTotal: 0,
    openingBalance: 0,
    cashStatus: 'aberto'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.ct_id) return;

      try {
        // Fetch products for quick sale
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, price, category')
          .eq('ct_id', profile.ct_id)
          .eq('category', 'cantina')
          .eq('active', true)
          .limit(6);

        if (productsData) setProducts(productsData);

        // Fetch today's cash
        const today = new Date().toISOString().split('T')[0];
        const { data: cashData } = await supabase
          .from('daily_cash')
          .select('id, opening_balance, status, closing_balance')
          .eq('ct_id', profile.ct_id)
          .eq('date', today)
          .single();

        if (cashData) {
          // Fetch today's transactions
          const { data: transData } = await supabase
            .from('cash_transactions')
            .select('id, amount, description, type, payment_method, created_at')
            .eq('daily_cash_id', cashData.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (transData) {
            setTransactions(transData);
            const todayTotal = transData.reduce((acc, t) => 
              t.type === 'entrada' ? acc + Number(t.amount) : acc - Number(t.amount), 0
            );
            setStats({
              currentBalance: cashData.opening_balance + todayTotal,
              todaySales: transData.filter(t => t.type === 'entrada').length,
              todayTotal,
              openingBalance: cashData.opening_balance,
              cashStatus: cashData.status
            });
          }
        } else {
          // No cash opened today
          setStats({
            currentBalance: 0,
            todaySales: 0,
            todayTotal: 0,
            openingBalance: 0,
            cashStatus: 'fechado'
          });
        }

      } catch (error) {
        console.error('Error fetching atendente dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profile?.ct_id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard do Atendente</h1>
        <p className="text-muted-foreground">Bem-vindo(a), {profile?.name?.split(' ')[0]}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-success/5 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caixa Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {stats.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">saldo disponível</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySales}</div>
            <p className="text-xs text-muted-foreground">transações realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySales}</div>
            <p className="text-xs text-muted-foreground">pessoas hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.todayTotal >= 0 ? '+' : ''}R$ {stats.todayTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">entrada hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick POS and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Sale Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Venda Rápida - Cantina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {products.length > 0 ? products.map(product => (
                <button
                  key={product.id}
                  className="p-4 rounded-lg bg-muted hover:bg-primary/10 hover:border-primary border border-border transition-all text-left"
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-lg font-bold text-primary">R$ {Number(product.price).toFixed(2)}</p>
                </button>
              )) : (
                <p className="col-span-2 text-center text-muted-foreground py-4">
                  Nenhum produto cadastrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Últimos Lançamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length > 0 ? transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${t.type === 'entrada' ? 'bg-success' : 'bg-destructive'}`} />
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground uppercase">{t.payment_method}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${t.type === 'entrada' ? 'text-success' : 'text-destructive'}`}>
                    {t.type === 'entrada' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                  </p>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum lançamento hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Status */}
      <Card className={stats.cashStatus === 'aberto' ? 'border-success/50' : 'border-destructive/50'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-medium">Status do Caixa</p>
                <p className="text-sm text-muted-foreground">
                  Saldo inicial: R$ {stats.openingBalance.toFixed(2)}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              stats.cashStatus === 'aberto' 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {stats.cashStatus === 'aberto' ? 'ABERTO' : 'FECHADO'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AtendenteDashboard;