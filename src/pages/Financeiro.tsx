import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Search, Filter, Plus } from 'lucide-react';
import { mockTransactions, getDashboardStats } from '@/data/mockData';

const Financeiro = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const stats = getDashboardStats();

  const filteredTransactions = mockTransactions.filter(t =>
    t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pago: 'bg-green-500/10 text-green-500 border-green-500/20',
    pendente: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    atrasado: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const typeColors: Record<string, string> = {
    mensalidade: 'bg-primary/10 text-primary',
    cantina: 'bg-secondary/10 text-secondary',
    loja: 'bg-accent/10 text-accent',
    evento: 'bg-muted text-muted-foreground',
    outros: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Gestão financeira do CT</p>
        </div>
        <Button className="btn-presence text-white">
          <Plus className="h-4 w-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              R$ {stats.pendingPayments.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">pendente</p>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.defaulters}
            </div>
            <p className="text-xs text-muted-foreground">alunos atrasados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 8.200</div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="mensalidade">Mensalidades</TabsTrigger>
            <TabsTrigger value="cantina">Cantina</TabsTrigger>
            <TabsTrigger value="loja">Loja</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.studentName}</TableCell>
                      <TableCell>
                        <Badge className={typeColors[transaction.type]}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="font-medium">
                        R$ {transaction.amount.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>{transaction.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[transaction.status]}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mensalidade">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.filter(t => t.type === 'mensalidade').map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.studentName}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="font-medium">
                        R$ {transaction.amount.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>{transaction.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[transaction.status]}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cantina">
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Vendas da cantina aparecem aqui
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loja">
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Vendas da loja aparecem aqui
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border text-center">
              <p className="text-2xl font-bold text-primary">PIX</p>
              <p className="text-sm text-muted-foreground">Integração disponível</p>
              <Badge className="mt-2 bg-green-500/10 text-green-500">Ativo</Badge>
            </div>
            <div className="p-4 rounded-lg border border-border text-center">
              <p className="text-2xl font-bold text-secondary">Cartão</p>
              <p className="text-sm text-muted-foreground">Em breve</p>
              <Badge className="mt-2 bg-yellow-500/10 text-yellow-500">Pendente</Badge>
            </div>
            <div className="p-4 rounded-lg border border-border text-center">
              <p className="text-2xl font-bold text-accent">Assinatura</p>
              <p className="text-sm text-muted-foreground">Em breve</p>
              <Badge className="mt-2 bg-yellow-500/10 text-yellow-500">Pendente</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;
