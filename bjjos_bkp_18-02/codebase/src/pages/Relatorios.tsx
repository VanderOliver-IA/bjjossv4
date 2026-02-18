import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Printer, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import ReportChart from '@/components/reports/ReportChart';
import ReportLayout from '@/components/reports/ReportLayout';
import DateRangeFilter, { DateRange, getDateRangeForPeriod } from '@/components/reports/DateRangeFilter';

const mockPresenceData = [
  { name: 'Seg', value: 25 },
  { name: 'Ter', value: 32 },
  { name: 'Qua', value: 28 },
  { name: 'Qui', value: 35 },
  { name: 'Sex', value: 30 },
  { name: 'Sáb', value: 45 },
];

const mockFinanceData = [
  { name: 'Jan', value: 15000 },
  { name: 'Fev', value: 17500 },
  { name: 'Mar', value: 16800 },
  { name: 'Abr', value: 19200 },
  { name: 'Mai', value: 18500 },
  { name: 'Jun', value: 21000 },
];

const mockBeltData = [
  { name: 'Branca', value: 45 },
  { name: 'Azul', value: 30 },
  { name: 'Roxa', value: 15 },
  { name: 'Marrom', value: 8 },
  { name: 'Preta', value: 2 },
];

const mockStatusData = [
  { name: 'Ativos', value: 85 },
  { name: 'Inativos', value: 10 },
  { name: 'Experimental', value: 5 },
];

const Relatorios = () => {
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeForPeriod('30days'));

  const presenceSections = [
    { id: 'summary', label: 'Resumo de Presença', component: <ReportChart title="Presenças por Dia" data={mockPresenceData} defaultType="bar" /> },
    { id: 'byClass', label: 'Por Turma', component: <ReportChart title="Presenças por Turma" data={mockPresenceData} defaultType="bar" /> },
    { id: 'trend', label: 'Tendência', component: <ReportChart title="Tendência de Presenças" data={mockPresenceData} defaultType="line" /> },
  ];

  const financeSections = [
    { id: 'revenue', label: 'Receitas', component: <ReportChart title="Receita Mensal" data={mockFinanceData} defaultType="bar" /> },
    { id: 'overdue', label: 'Inadimplência', component: <ReportChart title="Valores em Atraso" data={mockFinanceData} defaultType="line" /> },
  ];

  const studentSections = [
    { id: 'belt', label: 'Distribuição por Faixa', component: <ReportChart title="Alunos por Faixa" data={mockBeltData} defaultType="pie" /> },
    { id: 'status', label: 'Status dos Alunos', component: <ReportChart title="Status" data={mockStatusData} defaultType="pie" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Análises e relatórios completos do CT</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Alunos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground">+5% este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-bjj-azul" />
              Presenças/Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">432</div>
            <p className="text-xs text-muted-foreground">Média: 5.1/aluno</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 21.000</div>
            <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-bjj-roxo" />
              Taxa de Retenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-4">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="presence">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="presence">Presença</TabsTrigger>
          <TabsTrigger value="finance">Financeiro</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="classes">Turmas</TabsTrigger>
        </TabsList>

        <TabsContent value="presence" className="mt-6">
          <ReportLayout 
            title="Relatório de Presença" 
            description="Análise de frequência dos alunos"
            sections={presenceSections}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReportChart title="Presenças por Dia da Semana" data={mockPresenceData} defaultType="bar" />
              <ReportChart title="Tendência de Presenças" data={mockPresenceData} defaultType="line" />
            </div>
            <ReportChart title="Presenças por Turma" data={mockPresenceData} defaultType="pie" />
          </ReportLayout>
        </TabsContent>

        <TabsContent value="finance" className="mt-6">
          <ReportLayout 
            title="Relatório Financeiro" 
            description="Receitas, despesas e inadimplência"
            sections={financeSections}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReportChart title="Receita Mensal" data={mockFinanceData} defaultType="bar" />
              <ReportChart title="Evolução de Receita" data={mockFinanceData} defaultType="line" />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Recebido</p>
                    <p className="text-xl font-bold text-primary">R$ 108.000</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Pendente</p>
                    <p className="text-xl font-bold text-yellow-500">R$ 4.500</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Em Atraso</p>
                    <p className="text-xl font-bold text-destructive">R$ 2.100</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Ticket Médio</p>
                    <p className="text-xl font-bold">R$ 247</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ReportLayout>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <ReportLayout 
            title="Relatório de Alunos" 
            description="Análise do quadro de alunos"
            sections={studentSections}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReportChart title="Distribuição por Faixa" data={mockBeltData} defaultType="pie" />
              <ReportChart title="Status dos Alunos" data={mockStatusData} defaultType="pie" />
            </div>
          </ReportLayout>
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          <ReportLayout 
            title="Relatório de Turmas" 
            description="Análise de ocupação e frequência por turma"
            sections={[
              { id: 'occupation', label: 'Ocupação', component: <ReportChart title="Ocupação por Turma" data={mockPresenceData} defaultType="bar" /> },
            ]}
          >
            <ReportChart title="Frequência Média por Turma" data={mockPresenceData} defaultType="bar" />
            <Card>
              <CardHeader>
                <CardTitle>Turmas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Iniciantes Manhã', 'Avançados Noite', 'Kids', 'Competição', 'Feminino'].map((turma, i) => (
                    <div key={turma} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{turma}</p>
                        <p className="text-sm text-muted-foreground">{10 + i * 3} alunos matriculados</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">{75 + i * 4}%</p>
                        <p className="text-xs text-muted-foreground">ocupação</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ReportLayout>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
