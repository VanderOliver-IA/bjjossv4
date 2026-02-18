import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Award, TrendingUp, Calendar, User } from 'lucide-react';
import ReportChart from '@/components/reports/ReportChart';
import DateRangeFilter, { DateRange, getDateRangeForPeriod } from '@/components/reports/DateRangeFilter';

type BeltType = 'branca' | 'azul' | 'roxa' | 'marrom' | 'preta';

interface GraduationRecord {
  id: string;
  studentId: string;
  studentName: string;
  fromBelt: BeltType;
  toBelt: BeltType;
  fromStripes: number;
  toStripes: number;
  date: string;
  eventName?: string;
}

interface StudentGraduation {
  id: string;
  name: string;
  currentBelt: BeltType;
  stripes: number;
  lastGraduation: string;
  totalPresences: number;
  timeInBelt: string;
  eligible: boolean;
}

const mockGraduations: GraduationRecord[] = [
  { id: '1', studentId: '1', studentName: 'João Silva', fromBelt: 'branca', toBelt: 'branca', fromStripes: 3, toStripes: 4, date: '2024-01-15' },
  { id: '2', studentId: '2', studentName: 'Maria Santos', fromBelt: 'azul', toBelt: 'azul', fromStripes: 2, toStripes: 3, date: '2024-01-15' },
  { id: '3', studentId: '3', studentName: 'Pedro Costa', fromBelt: 'branca', toBelt: 'azul', fromStripes: 4, toStripes: 0, date: '2024-01-15', eventName: 'Graduação Dezembro 2023' },
];

const mockStudents: StudentGraduation[] = [
  { id: '1', name: 'João Silva', currentBelt: 'branca', stripes: 4, lastGraduation: '2024-01-15', totalPresences: 120, timeInBelt: '8 meses', eligible: true },
  { id: '2', name: 'Maria Santos', currentBelt: 'azul', stripes: 3, lastGraduation: '2024-01-15', totalPresences: 200, timeInBelt: '1 ano e 2 meses', eligible: true },
  { id: '3', name: 'Pedro Costa', currentBelt: 'azul', stripes: 0, lastGraduation: '2024-01-15', totalPresences: 250, timeInBelt: '2 meses', eligible: false },
  { id: '4', name: 'Ana Oliveira', currentBelt: 'roxa', stripes: 2, lastGraduation: '2023-10-20', totalPresences: 450, timeInBelt: '1 ano e 6 meses', eligible: true },
  { id: '5', name: 'Carlos Lima', currentBelt: 'marrom', stripes: 3, lastGraduation: '2023-06-15', totalPresences: 800, timeInBelt: '2 anos', eligible: true },
];

const beltColors: Record<BeltType, string> = {
  branca: 'bg-white text-black border',
  azul: 'bg-bjj-azul text-white',
  roxa: 'bg-bjj-roxo text-white',
  marrom: 'bg-bjj-marrom text-white',
  preta: 'bg-black text-white',
};

const beltLabels: Record<BeltType, string> = {
  branca: 'Branca',
  azul: 'Azul',
  roxa: 'Roxa',
  marrom: 'Marrom',
  preta: 'Preta',
};

const Graduacao = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [beltFilter, setBeltFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeForPeriod('30days'));
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBelt = beltFilter === 'all' || student.currentBelt === beltFilter;
    return matchesSearch && matchesBelt;
  });

  const beltDistribution = Object.entries(beltLabels).map(([belt, label]) => ({
    name: label,
    value: mockStudents.filter(s => s.currentBelt === belt).length,
    color: belt === 'branca' ? 'hsl(var(--muted))' : 
           belt === 'azul' ? 'hsl(var(--bjj-azul))' :
           belt === 'roxa' ? 'hsl(var(--bjj-roxo))' :
           belt === 'marrom' ? 'hsl(var(--bjj-marrom))' : 'hsl(var(--foreground))',
  }));

  const eligibleCount = mockStudents.filter(s => s.eligible).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Graduação</h1>
          <p className="text-muted-foreground">Controle de faixas e graus dos alunos</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 btn-presence">
              <Award className="h-4 w-4" />
              Registrar Graduação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Graduação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Aluno</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {beltLabels[student.currentBelt]} {student.stripes} graus
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nova Faixa</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Faixa" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(beltLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Graus</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Graus" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} grau{n !== 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Evento (opcional)</Label>
                <Input placeholder="Nome do evento de graduação" />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea placeholder="Notas sobre a graduação..." />
              </div>
              <Button className="w-full" onClick={() => setIsAddOpen(false)}>
                Registrar Graduação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-4">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Graduações no Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGraduations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Elegíveis para Graduação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{eligibleCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Novas Faixas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bjj-azul">
              {mockGraduations.filter(g => g.fromBelt !== g.toBelt).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Graus Concedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bjj-roxo">
              {mockGraduations.filter(g => g.fromBelt === g.toBelt).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart title="Distribuição por Faixa" data={beltDistribution} defaultType="pie" />
        <Card>
          <CardHeader>
            <CardTitle>Últimas Graduações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockGraduations.slice(0, 5).map(grad => (
                <div key={grad.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{grad.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {beltLabels[grad.fromBelt]} {grad.fromStripes}° → {beltLabels[grad.toBelt]} {grad.toStripes}°
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(grad.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar aluno..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={beltFilter} onValueChange={setBeltFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por faixa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as faixas</SelectItem>
                {Object.entries(beltLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.map(student => (
          <Card key={student.id} className={student.eligible ? 'border-primary/50' : ''}>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{student.name}</h3>
                      {student.eligible && (
                        <Badge className="bg-primary">Elegível</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={beltColors[student.currentBelt]}>
                        {beltLabels[student.currentBelt]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {student.stripes} grau{student.stripes !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {student.totalPresences} presenças
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {student.timeInBelt} na faixa
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Graduacao;
