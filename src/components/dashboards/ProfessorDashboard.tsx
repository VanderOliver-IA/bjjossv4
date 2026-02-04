import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, UserCheck, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ClassData {
  id: string;
  name: string;
  schedule: string;
  student_count?: number;
}

interface AttendanceData {
  id: string;
  date: string;
  training_classes?: {
    name: string;
  };
  attendance_students: Array<{ id: string }>;
  visitors: number;
}

const ProfessorDashboard = () => {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [myClasses, setMyClasses] = useState<ClassData[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceData[]>([]);
  const [stats, setStats] = useState({
    todayAttendance: 0,
    totalStudents: 0,
    averageAttendance: 82
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;

      try {
        // Fetch my classes
        const { data: classesData } = await supabase
          .from('training_classes')
          .select('id, name, schedule, time_start, time_end')
          .eq('professor_id', profile.id)
          .eq('active', true);

        if (classesData) {
          // Get student count for each class
          const classesWithCount = await Promise.all(
            classesData.map(async (cls) => {
              const { count } = await supabase
                .from('student_classes')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', cls.id);
              return { ...cls, student_count: count || 0 };
            })
          );
          setMyClasses(classesWithCount);

          // Calculate total students
          const totalStudents = classesWithCount.reduce((acc, cls) => acc + (cls.student_count || 0), 0);
          setStats(prev => ({ ...prev, totalStudents }));
        }

        // Fetch today's attendance for my classes
        const today = new Date().toISOString().split('T')[0];
        if (classesData && classesData.length > 0) {
          const classIds = classesData.map(c => c.id);
          const { data: todayAtt } = await supabase
            .from('attendance_records')
            .select('id, attendance_students(id)')
            .in('class_id', classIds)
            .eq('date', today);

          const todayCount = todayAtt?.reduce((acc, a) => acc + (a.attendance_students?.length || 0), 0) || 0;
          setStats(prev => ({ ...prev, todayAttendance: todayCount }));

          // Fetch recent attendance
          const { data: attData } = await supabase
            .from('attendance_records')
            .select(`
              id,
              date,
              visitors,
              training_classes(name),
              attendance_students(id)
            `)
            .in('class_id', classIds)
            .order('date', { ascending: false })
            .limit(5);

          if (attData) setRecentAttendance(attData as AttendanceData[]);
        }

      } catch (error) {
        console.error('Error fetching professor dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profile?.id]);

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
        <h1 className="text-3xl font-bold">Painel Principal do Professor</h1>
        <p className="text-muted-foreground">Bem-vindo, {profile?.name?.split(' ')[0]}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presença Hoje</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAttendance}</div>
            <p className="text-xs text-muted-foreground">alunos treinaram</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Turmas</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myClasses.length}</div>
            <p className="text-xs text-muted-foreground">turmas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">nas minhas turmas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Minhas Turmas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myClasses.length > 0 ? myClasses.map(cls => (
              <div key={cls.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium">{cls.name}</p>
                  <p className="text-sm text-muted-foreground">{cls.schedule || 'Horário não definido'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{cls.student_count}</p>
                  <p className="text-xs text-muted-foreground">alunos</p>
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">Nenhuma turma atribuída</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Presenças Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAttendance.length > 0 ? recentAttendance.map(att => (
              <div key={att.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{att.training_classes?.name || 'Treino'}</p>
                    <p className="text-sm text-muted-foreground">{att.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-bold">{att.attendance_students?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">presentes</p>
                  </div>
                  {att.visitors > 0 && (
                    <div className="text-center">
                      <p className="font-bold text-secondary">{att.visitors}</p>
                      <p className="text-xs text-muted-foreground">visitantes</p>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">Nenhuma presença registrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessorDashboard;