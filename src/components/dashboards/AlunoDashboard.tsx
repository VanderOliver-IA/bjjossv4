import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Award, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { mockStudents, mockAttendance, mockTransactions, mockEvents } from '@/data/mockData';

const AlunoDashboard = () => {
  const student = mockStudents.find(s => s.id === 's1'); // Pedro Costa (aluno logado)
  const myAttendances = mockAttendance.filter(a => a.studentIds.includes('s1'));
  const myTransactions = mockTransactions.filter(t => t.studentId === 's1');
  const upcomingEvents = mockEvents.filter(e => new Date(e.date) > new Date());

  if (!student) return null;

  const beltColors: Record<string, string> = {
    branca: 'bg-white text-black border border-gray-300',
    azul: 'bg-belt-blue text-white',
    roxa: 'bg-belt-purple text-white',
    marrom: 'bg-belt-brown text-white',
    preta: 'bg-belt-black text-white',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Olá, {student.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Acompanhe sua evolução no Jiu-Jitsu</p>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary to-secondary" />
        <CardContent className="relative pt-0">
          <div className="flex items-end gap-4 -mt-10">
            <img 
              src={student.photoFront} 
              alt={student.name}
              className="w-20 h-20 rounded-full border-4 border-card object-cover"
            />
            <div className="pb-2">
              <h2 className="text-xl font-bold">{student.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${beltColors[student.belt]}`}>
                  {student.belt.toUpperCase()} • {student.stripes} graus
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presenças no Mês</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">treinos realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">dias seguidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Situação</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Em dia</div>
            <p className="text-xs text-muted-foreground">mensalidade paga</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Graduação</CardTitle>
            <Award className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
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
              {myAttendances.slice(0, 5).map(att => (
                <div key={att.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{att.className}</p>
                    <p className="text-sm text-muted-foreground">{att.date}</p>
                  </div>
                </div>
              ))}
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
              {upcomingEvents.map(event => (
                <div key={event.id} className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {event.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-muted-foreground">{event.date}</span>
                  </div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlunoDashboard;
