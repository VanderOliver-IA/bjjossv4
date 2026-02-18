import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Award, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentData {
  id: string;
  name: string;
  belt: string;
  stripes: number;
  photo_front: string | null;
  balance: number;
}

interface AttendanceData {
  id: string;
  date: string;
  training_classes?: {
    name: string;
  };
}

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
}

const AlunoDashboard = () => {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [attendances, setAttendances] = useState<AttendanceData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;

      try {
        // Fetch student data linked to this profile
        const { data: studentData } = await supabase
          .from('students')
          .select('id, name, belt, stripes, photo_front, balance')
          .eq('profile_id', profile.id)
          .single();

        if (studentData) {
          setStudent(studentData);

          // Fetch recent attendances for this student
          const { data: attData } = await supabase
            .from('attendance_students')
            .select(`
              id,
              attendance_records(
                id,
                date,
                training_classes(name)
              )
            `)
            .eq('student_id', studentData.id)
            .order('id', { ascending: false })
            .limit(5);

          if (attData) {
            const formattedAtt = attData
              .filter(a => a.attendance_records)
              .map(a => ({
                id: a.attendance_records!.id,
                date: a.attendance_records!.date,
                training_classes: a.attendance_records!.training_classes
              }));
            setAttendances(formattedAtt as AttendanceData[]);
          }

          // Count monthly attendances
          const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
          const { count } = await supabase
            .from('attendance_students')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', studentData.id);
          
          setMonthlyAttendance(count || 0);
        }

        // Fetch upcoming events
        const today = new Date().toISOString().split('T')[0];
        const { data: eventsData } = await supabase
          .from('events')
          .select('id, title, description, date, type')
          .eq('ct_id', profile.ct_id)
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(3);

        if (eventsData) setEvents(eventsData);

      } catch (error) {
        console.error('Error fetching aluno dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profile?.id, profile?.ct_id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <Skeleton className="h-40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const beltColors: Record<string, string> = {
    branca: 'bg-white text-black border border-border',
    azul: 'bg-primary text-primary-foreground',
    roxa: 'bg-secondary text-secondary-foreground',
    marrom: 'bg-accent text-accent-foreground',
    preta: 'bg-foreground text-background',
  };

  const displayName = student?.name || profile?.name || 'Aluno';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Olá, {firstName}!</h1>
        <p className="text-muted-foreground">Acompanhe sua evolução no Jiu-Jitsu</p>
      </div>

      {/* Profile Card */}
      {student && (
        <Card className="overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary to-secondary" />
          <CardContent className="relative pt-0">
            <div className="flex items-end gap-4 -mt-10">
              <div className="w-20 h-20 rounded-full border-4 border-card bg-muted flex items-center justify-center overflow-hidden">
                {student.photo_front ? (
                  <img 
                    src={student.photo_front} 
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {student.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="pb-2">
                <h2 className="text-xl font-bold">{student.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${beltColors[student.belt] || beltColors.branca}`}>
                    {student.belt.toUpperCase()} • {student.stripes} grau{student.stripes !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presenças no Mês</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyAttendance}</div>
            <p className="text-xs text-muted-foreground">treinos realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.min(monthlyAttendance, 5)}</div>
            <p className="text-xs text-muted-foreground">dias seguidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Situação</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(student?.balance || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {(student?.balance || 0) >= 0 ? 'Em dia' : 'Pendente'}
            </div>
            <p className="text-xs text-muted-foreground">
              {(student?.balance || 0) < 0 ? `R$ ${Math.abs(student?.balance || 0).toFixed(2)}` : 'mensalidade paga'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Graduação</CardTitle>
            <Award className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~60</div>
            <p className="text-xs text-muted-foreground">dias estimados</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Últimos Treinos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendances.length > 0 ? attendances.map(att => (
                <div key={att.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{att.training_classes?.name || 'Treino'}</p>
                    <p className="text-sm text-muted-foreground">{att.date}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum treino registrado ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length > 0 ? events.map(event => (
                <div key={event.id} className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground uppercase">
                      {event.type}
                    </span>
                    <span className="text-sm text-muted-foreground">{event.date}</span>
                  </div>
                  <p className="font-medium">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum evento próximo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlunoDashboard;