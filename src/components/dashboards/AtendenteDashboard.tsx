import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, DollarSign, Users, TrendingUp, Clock, Receipt } from 'lucide-react';
import { mockDailyCash, mockProducts, mockTransactions } from '@/data/mockData';

const AtendenteDashboard = () => {
  const todayTotal = mockDailyCash.transactions.reduce((acc, t) => 
    t.type === 'entrada' ? acc + t.amount : acc - t.amount, 0
  );
  const currentBalance = mockDailyCash.openingBalance + todayTotal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard do Atendente</h1>
        <p className="text-muted-foreground">Bem-vinda, Maria Santos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caixa Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              R$ {currentBalance.toLocaleString('pt-BR')}
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
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">transações realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">pessoas hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+R$ {todayTotal}</div>
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
              {mockProducts.filter(p => p.category === 'cantina').slice(0, 6).map(product => (
                <button
                  key={product.id}
                  className="p-4 rounded-lg bg-muted hover:bg-primary/10 hover:border-primary border border-border transition-all text-left"
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-lg font-bold text-primary">R$ {product.price}</p>
                </button>
              ))}
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
              {mockDailyCash.transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${t.type === 'entrada' ? 'bg-green-500' : 'bg-destructive'}`} />
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{t.paymentMethod.toUpperCase()}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${t.type === 'entrada' ? 'text-green-500' : 'text-destructive'}`}>
                    {t.type === 'entrada' ? '+' : '-'} R$ {t.amount}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Status */}
      <Card className={mockDailyCash.status === 'aberto' ? 'border-green-500/50' : 'border-destructive/50'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-medium">Status do Caixa</p>
                <p className="text-sm text-muted-foreground">
                  Aberto às 08:00 - Saldo inicial: R$ {mockDailyCash.openingBalance}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              mockDailyCash.status === 'aberto' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {mockDailyCash.status === 'aberto' ? 'ABERTO' : 'FECHADO'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AtendenteDashboard;
