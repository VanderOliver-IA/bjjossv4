import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DollarSign, 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Calculator,
  Clock,
  CheckCircle,
  Lock
} from 'lucide-react';

type CashStatus = 'aberto' | 'fechado';
type TransactionType = 'entrada' | 'saida';
type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';

interface CashTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

interface DailyCash {
  id: string;
  date: string;
  openingBalance: number;
  closingBalance?: number;
  status: CashStatus;
  transactions: CashTransaction[];
}

const mockCash: DailyCash = {
  id: '1',
  date: new Date().toISOString().split('T')[0],
  openingBalance: 500,
  status: 'aberto',
  transactions: [
    { id: '1', type: 'entrada', amount: 150, description: 'Mensalidade - João Silva', paymentMethod: 'pix', createdAt: '09:30' },
    { id: '2', type: 'entrada', amount: 80, description: 'Venda Cantina', paymentMethod: 'dinheiro', createdAt: '10:15' },
    { id: '3', type: 'saida', amount: 50, description: 'Troco para caixa', paymentMethod: 'dinheiro', createdAt: '11:00' },
    { id: '4', type: 'entrada', amount: 200, description: 'Mensalidade - Maria Santos', paymentMethod: 'cartao', createdAt: '14:30' },
  ],
};

const paymentLabels: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
};

const CaixaDia = () => {
  const [cash, setCash] = useState<DailyCash>(mockCash);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('entrada');

  const totalEntradas = cash.transactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaidas = cash.transactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoAtual = cash.openingBalance + totalEntradas - totalSaidas;

  const handleCloseCash = () => {
    setCash(prev => ({
      ...prev,
      status: 'fechado',
      closingBalance: saldoAtual,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Caixa do Dia</h1>
          <p className="text-muted-foreground">
            {new Date(cash.date).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex gap-2">
          {cash.status === 'aberto' ? (
            <>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Lançamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Lançamento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant={transactionType === 'entrada' ? 'default' : 'outline'}
                        className="flex-1 gap-2"
                        onClick={() => setTransactionType('entrada')}
                      >
                        <ArrowUpCircle className="h-4 w-4" />
                        Entrada
                      </Button>
                      <Button
                        variant={transactionType === 'saida' ? 'destructive' : 'outline'}
                        className="flex-1 gap-2"
                        onClick={() => setTransactionType('saida')}
                      >
                        <ArrowDownCircle className="h-4 w-4" />
                        Saída
                      </Button>
                    </div>
                    <div>
                      <Label>Valor</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input placeholder="Descrição do lançamento" />
                    </div>
                    <div>
                      <Label>Forma de Pagamento</Label>
                      <Select defaultValue="dinheiro">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(paymentLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={() => setIsAddOpen(false)}>
                      Registrar Lançamento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="gap-2" onClick={handleCloseCash}>
                <Lock className="h-4 w-4" />
                Fechar Caixa
              </Button>
            </>
          ) : (
            <Badge variant="secondary" className="h-10 px-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Caixa Fechado
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Saldo Inicial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {cash.openingBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-primary" />
              Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              + R$ {totalEntradas.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-destructive" />
              Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              - R$ {totalSaidas.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Saldo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {saldoAtual.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(paymentLabels).map(([method, label]) => {
              const total = cash.transactions
                .filter(t => t.paymentMethod === method && t.type === 'entrada')
                .reduce((sum, t) => sum + t.amount, 0);
              return (
                <div key={method} className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">R$ {total.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cash.transactions.map(transaction => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  {transaction.type === 'entrada' ? (
                    <ArrowUpCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{transaction.createdAt}</span>
                      <Badge variant="outline">{paymentLabels[transaction.paymentMethod]}</Badge>
                    </div>
                  </div>
                </div>
                <span className={`font-bold ${
                  transaction.type === 'entrada' ? 'text-primary' : 'text-destructive'
                }`}>
                  {transaction.type === 'entrada' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaixaDia;
