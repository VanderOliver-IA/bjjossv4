import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Plus, Search, Filter, Eye, Edit, QrCode, User } from 'lucide-react';
import QRCodeDialog from '@/components/students/QRCodeDialog';
import { mockStudents } from '@/data/mockData';
import { Student, BeltType } from '@/types';
import { AddStudentDialog } from '@/components/students/AddStudentDialog';
import { cn } from '@/lib/utils';

const Alunos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isQRCOdeOpen, setIsQRCodeOpen] = useState(false);

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const beltConfig: Record<BeltType, string> = {
    branca: 'bg-[hsl(var(--belt-white))] text-black border-border',
    azul: 'bg-[hsl(var(--belt-blue))] text-white border-transparent',
    roxa: 'bg-[hsl(var(--belt-purple))] text-white border-transparent',
    marrom: 'bg-[hsl(var(--belt-brown))] text-white border-transparent',
    preta: 'bg-[hsl(var(--belt-black))] text-white border-primary/30',
  };

  const statusConfig: Record<string, string> = {
    ativo: 'bg-belt-green/10 text-belt-green border-belt-green/20',
    inativo: 'bg-destructive/10 text-destructive border-border',
    experimental: 'bg-belt-yellow/10 text-belt-yellow border-belt-yellow/20',
  };

  return (
    <div className="space-y-8 page-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Gestão de <span className="text-primary">Alunos</span></h1>
          <p className="text-sm text-muted-foreground font-medium">Controle de membros, graduações e status financeiro.</p>
        </div>
        <AddStudentDialog />
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total', value: mockStudents.length, color: 'text-foreground' },
          { label: 'Ativos', value: mockStudents.filter(s => s.status === 'ativo').length, color: 'text-belt-green' },
          { label: 'Pendentes', value: mockStudents.filter(s => s.status === 'inativo').length, color: 'text-destructive' },
          { label: 'Experimental', value: mockStudents.filter(s => s.status === 'experimental').length, color: 'text-belt-yellow' },
        ].map((stat, i) => (
          <Card key={i} className="sharp-card hover:bg-muted/30 transition-colors">
            <CardContent className="p-6">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{stat.label}</p>
              <p className={cn("text-3xl font-black tracking-tighter leading-none", stat.color)}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 rounded-lg bg-card border-border"
          />
        </div>
        <Button variant="outline" className="h-12 rounded-lg gap-2 border-border font-bold text-xs uppercase px-6">
          <Filter className="h-3.5 w-3.5" /> Filtros
        </Button>
      </div>

      {/* Table Section */}
      <Card className="sharp-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4">Aluno</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4">Graduação</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 hidden lg:table-cell">WhatsApp</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/20 transition-colors border-b border-border/50">
                  <TableCell>
                    <div className="flex items-center gap-4 py-1">
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0 border border-border">
                        {student.photoFront ? (
                          <img src={student.photoFront} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-full h-full p-2 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm tracking-tight truncate leading-tight uppercase">{student.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium truncate">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-[9px] font-black px-2.5 py-1 rounded h-fit uppercase tracking-tighter border", beltConfig[student.belt])}>
                      {student.belt} • {student.stripes}g
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter h-fit", statusConfig[student.status])}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs font-bold text-muted-foreground tabular-nums">{student.phone}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary rounded-md" onClick={() => setSelectedStudent(student)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl rounded-none border-border">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-black italic uppercase italic tracking-tighter">Ficha do Aluno</DialogTitle>
                          </DialogHeader>
                          {selectedStudent && (
                            <StudentDetails
                              student={selectedStudent}
                              onGenerateQR={() => setIsQRCodeOpen(true)}
                              beltStyles={beltConfig}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted rounded-md">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">Nenhum aluno encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {selectedStudent && (
        <QRCodeDialog
          isOpen={isQRCOdeOpen}
          onOpenChange={setIsQRCodeOpen}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
        />
      )}
    </div>
  );
};

const StudentDetails = ({
  student,
  onGenerateQR,
  beltStyles
}: {
  student: Student,
  onGenerateQR: () => void,
  beltStyles: Record<BeltType, string>
}) => {
  return (
    <div className="space-y-8 py-4">
      {/* Bio Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-28 h-28 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0 shadow-sm">
          <img src={student.photoFront} alt={student.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{student.name}</h3>
          <p className="text-sm text-muted-foreground font-medium">{student.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
            <Badge className={cn("text-[10px] font-black px-3 h-7 rounded uppercase tracking-tighter border", beltStyles[student.belt])}>
              {student.belt.toUpperCase()} • {student.stripes} GRAUS
            </Badge>
            <Button size="sm" onClick={onGenerateQR} className="h-7 gap-2 rounded text-[10px] font-bold uppercase tracking-widest px-4 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
              <QrCode className="w-3.5 h-3.5" /> Gerar Acesso
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Dados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Contato', value: student.phone },
          { label: 'Nascimento', value: student.birthDate },
          { label: 'Matrícula', value: student.enrollmentDate },
          { label: 'Saldo', value: `R$ ${student.balance}`, color: student.balance < 0 ? 'text-destructive' : 'text-belt-green' }
        ].map((item, i) => (
          <div key={i} className="p-4 rounded border border-border bg-muted/30">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">{item.label}</p>
            <p className={cn("text-xs font-bold tabular-nums truncate", item.color || "text-foreground")}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Recognition */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recognition Assets</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="aspect-square rounded border border-border overflow-hidden bg-muted group relative">
            <img src={student.photoFront} alt="Frente" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
            <div className="absolute bottom-2 left-2 px-2 h-5 bg-black/80 text-[8px] font-black text-white uppercase flex items-center rounded">FRENTE</div>
          </div>
          <div className="aspect-square rounded border border-border bg-muted/50 flex flex-col items-center justify-center gap-2">
            <User className="w-6 h-6 text-muted-foreground/30" />
            <span className="text-[8px] font-black text-muted-foreground uppercase opacity-50">ESQUERDA</span>
          </div>
          <div className="aspect-square rounded border border-border bg-muted/50 flex flex-col items-center justify-center gap-2">
            <User className="w-6 h-6 text-muted-foreground/30" />
            <span className="text-[8px] font-black text-muted-foreground uppercase opacity-50">DIREITA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alunos;
