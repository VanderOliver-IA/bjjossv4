import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Users, Clock, Calendar, ChevronRight } from 'lucide-react';
import { mockClasses, mockStudents } from '@/data/mockData';
import { TrainingClass } from '@/types';

const Turmas = () => {
  const [selectedClass, setSelectedClass] = useState<TrainingClass | null>(null);

  const levelColors: Record<string, string> = {
    iniciante: 'bg-green-500/10 text-green-500 border-green-500/20',
    intermediario: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    avancado: 'bg-primary/10 text-primary border-primary/20',
    todos: 'bg-secondary/10 text-secondary border-secondary/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Turmas</h1>
          <p className="text-muted-foreground">Gerencie as turmas e horários</p>
        </div>
        <Button className="btn-presence text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Turma
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total de Turmas</p>
            <p className="text-2xl font-bold">{mockClasses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Alunos Matriculados</p>
            <p className="text-2xl font-bold">
              {mockClasses.reduce((acc, c) => acc + c.studentIds.length, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Aulas/Semana</p>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Freq. Média</p>
            <p className="text-2xl font-bold text-green-500">78%</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockClasses.map((cls) => (
          <Dialog key={cls.id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <Badge variant="outline" className={levelColors[cls.level]}>
                      {cls.level.charAt(0).toUpperCase() + cls.level.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {cls.dayOfWeek.join(', ')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {cls.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">{cls.studentIds.length}</span>
                      <span className="text-muted-foreground">/ {cls.maxStudents} alunos</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">{cls.professorName}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{cls.name}</DialogTitle>
              </DialogHeader>
              <ClassDetails trainingClass={cls} />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

const ClassDetails = ({ trainingClass }: { trainingClass: TrainingClass }) => {
  const classStudents = mockStudents.filter(s => trainingClass.studentIds.includes(s.id));

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Professor</p>
          <p className="font-medium">{trainingClass.professorName}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Horário</p>
          <p className="font-medium">{trainingClass.schedule}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Nível</p>
          <p className="font-medium capitalize">{trainingClass.level}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Capacidade</p>
          <p className="font-medium">{trainingClass.studentIds.length} / {trainingClass.maxStudents}</p>
        </div>
      </div>

      {/* Students */}
      <div>
        <h4 className="font-medium mb-3">Alunos Matriculados ({classStudents.length})</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {classStudents.map(student => (
            <div key={student.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <img
                src={student.photoFront}
                alt={student.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{student.belt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Turmas;
