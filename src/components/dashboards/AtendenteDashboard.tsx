import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign, Store, ShoppingBag, PlusCircle, CreditCard, ChevronRight } from 'lucide-react';

const AtendenteDashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 text-primary font-bold bg-primary/5 uppercase tracking-tighter px-3">
            <DollarSign className="w-3 h-3 mr-1" />
            Front Desk & Sales
          </Badge>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Painel de Atendimento
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Controle fluxo de caixa, matrículas e vendas de cantina.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 font-bold">
            <Store className="w-4 h-4 mr-2" /> Estoque
          </Button>
          <Button className="bg-primary text-black font-bold hover:bg-primary/90 shadow-neon">
            <ShoppingBag className="w-4 h-4 mr-2" /> Nova Venda
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Vendas Hoje", value: "R$ 456,00", icon: ShoppingBag, color: "text-emerald-400" },
          { title: "Matrículas Pendentes", value: "8", icon: Users, color: "text-blue-400" },
          { title: "Caixa Aberto", value: "SIM", icon: DollarSign, color: "text-amber-400" },
          { title: "Mensalidades Vencendo", value: "12", icon: Calendar, color: "text-red-400" }
        ].map((stat, i) => (
          <Card key={i} className="bg-[#111114]/50 border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
              <stat.icon className="w-16 h-16" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Últimas Movimentações
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { desc: "Venda Balcão - Kimono A2", val: "R$ 450,00", type: "Equipamentos", time: "10:30" },
              { desc: "Mensalidade - João Silva", val: "R$ 180,00", type: "Mensalidade", time: "11:15" },
              { desc: "Venda Cantina - Açaí + Água", val: "R$ 32,00", type: "Alimentação", time: "11:45" },
              { desc: "Taxa de Matrícula - Pedro H.", val: "R$ 100,00", type: "Taxas", time: "12:00" },
            ].map((sale, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-[#111114]/30 border border-white/5 rounded-2xl hover:bg-[#111114]/50 transition-colors group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 text-primary">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{sale.desc}</h4>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{sale.time}</span> • <span>{sale.type}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white block">{sale.val}</span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Confirmado</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-500" />
            Ações de Caixa
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Button className="h-24 bg-[#111114]/50 border-white/5 rounded-2xl flex flex-col gap-2 hover:bg-white/5 hover:border-primary/50 transition-all group">
              <PlusCircle className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground group-hover:text-white">Nova Venda</span>
            </Button>
            <Button className="h-24 bg-[#111114]/50 border-white/5 rounded-2xl flex flex-col gap-2 hover:bg-white/5 hover:border-primary/50 transition-all group">
              <Users className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground group-hover:text-white">Matricular</span>
            </Button>
            <Button className="h-24 bg-[#111114]/50 border-white/5 rounded-2xl flex flex-col gap-2 hover:bg-white/5 hover:border-primary/50 transition-all group">
              <Store className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground group-hover:text-white">Estoque</span>
            </Button>
            <Button className="h-24 bg-[#111114]/50 border-white/5 rounded-2xl flex flex-col gap-2 hover:bg-white/5 hover:border-primary/50 transition-all group">
              <DollarSign className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground group-hover:text-white">Fechar Caixa</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtendenteDashboard;