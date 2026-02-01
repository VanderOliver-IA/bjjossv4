import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Filter, Eye, Edit, MoreHorizontal } from 'lucide-react';
import { mockStudents } from '@/data/mockData';
import { Student, BeltType } from '@/types';

const Alunos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const beltColors: Record<BeltType, string> = {
    branca: 'bg-white text-black border border-muted',
    azul: 'bg-primary text-primary-foreground',
    roxa: 'bg-secondary text-secondary-foreground',
    marrom: 'bg-accent text-accent-foreground',
    preta: 'bg-foreground text-background',
  };

  const statusColors: Record<string, string> = {
    ativo: 'bg-green-500/10 text-green-500 border-green-500/20',
    inativo: 'bg-destructive/10 text-destructive border-destructive/20',
    experimental: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-muted-foreground">Gerencie os alunos do CT</p>
        </div>
        <Button className="btn-presence text-white">
          <Plus className="h-4 w-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{mockStudents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-2xl font-bold text-green-500">
              {mockStudents.filter(s => s.status === 'ativo').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Inativos</p>
            <p className="text-2xl font-bold text-destructive">
              {mockStudents.filter(s => s.status === 'inativo').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Experimental</p>
            <p className="text-2xl font-bold text-yellow-500">
              {mockStudents.filter(s => s.status === 'experimental').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Faixa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="hidden md:table-cell">Matrícula</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={student.photoFront}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={beltColors[student.belt]}>
                      {student.belt.charAt(0).toUpperCase() + student.belt.slice(1)} • {student.stripes}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[student.status]}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">{student.enrollmentDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Aluno</DialogTitle>
                          </DialogHeader>
                          {selectedStudent && (
                            <StudentDetails student={selectedStudent} />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const StudentDetails = ({ student }: { student: Student }) => {
  const beltColors: Record<BeltType, string> = {
    branca: 'bg-white text-black border border-muted',
    azul: 'bg-primary text-primary-foreground',
    roxa: 'bg-secondary text-secondary-foreground',
    marrom: 'bg-accent text-accent-foreground',
    preta: 'bg-foreground text-background',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <img
          src={student.photoFront}
          alt={student.name}
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div>
          <h3 className="text-xl font-bold">{student.name}</h3>
          <p className="text-muted-foreground">{student.email}</p>
          <Badge className={`mt-2 ${beltColors[student.belt]}`}>
            {student.belt.toUpperCase()} • {student.stripes} graus
          </Badge>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Telefone</p>
          <p className="font-medium">{student.phone}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Data de Nascimento</p>
          <p className="font-medium">{student.birthDate}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Data de Matrícula</p>
          <p className="font-medium">{student.enrollmentDate}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Saldo</p>
          <p className={`font-medium ${student.balance < 0 ? 'text-destructive' : 'text-green-500'}`}>
            R$ {student.balance.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Photos for Recognition */}
      <div>
        <h4 className="font-medium mb-3">Fotos para Reconhecimento</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <img
              src={student.photoFront}
              alt="Frente"
              className="w-full aspect-square rounded-lg object-cover mb-2"
            />
            <p className="text-sm text-muted-foreground">Frente</p>
          </div>
          <div className="text-center">
            <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-2">
              <p className="text-sm text-muted-foreground">Lado Esq.</p>
            </div>
            <p className="text-sm text-muted-foreground">Pendente</p>
          </div>
          <div className="text-center">
            <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-2">
              <p className="text-sm text-muted-foreground">Lado Dir.</p>
            </div>
            <p className="text-sm text-muted-foreground">Pendente</p>
          </div>
        </div>
        <p className="text-xs text-yellow-500 mt-2">
          ⚠️ O envio das 3 imagens com qualidade é fundamental para o bom funcionamento do reconhecimento.
        </p>
      </div>
    </div>
  );
};

export default Alunos;
