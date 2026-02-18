import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, CheckCircle2, QrCode, ClipboardList, Dumbbell, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ProfessorDashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 text-primary font-bold bg-primary/5 uppercase tracking-tighter px-3">
            <Dumbbell className="w-3 h-3 mr-1" />
            Professor Space
          </Badge>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Painel do Professor
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Gerencie suas aulas e acompanhe a evolução dos alunos.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 font-bold">
            <Calendar className="w-4 h-4 mr-2" /> Agenda
          </Button>
          <Button className="bg-primary text-black font-bold hover:bg-primary/90 shadow-neon">
            <QrCode className="w-4 h-4 mr-2" /> Chamada Rápida
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Aulas Hoje", value: "3", icon: Calendar, color: "text-blue-400" },
          { title: "Alunos Esperados", value: "42", icon: Users, color: "text-indigo-400" },
          { title: "Presenças Confirmadas", value: "12", icon: CheckCircle2, color: "text-emerald-400" },
          { title: "Graduações Pendentes", value: "5", icon: Award, color: "text-amber-400" }
        ].map((stat, i) => (
          <Card key={i} className="bg-[#111114]/50 border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
              <stat.icon className="w-16 h-16" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Classes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Próximas Aulas
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { time: "18:00", name: "Jiu Jitsu Kids", level: "Iniciante", students: 15 },
              { time: "19:00", name: "Jiu Jitsu Adulto", level: "Todos", students: 25 },
              { time: "20:30", name: "No-Gi Submission", level: "Avançado", students: 12 }
            ].map((cls, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-[#111114]/30 border border-white/5 rounded-2xl hover:bg-[#111114]/50 transition-colors group">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/5 font-bold group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                    <span className="text-xs text-muted-foreground">HOJE</span>
                    <span className="text-lg text-white group-hover:text-primary">{cls.time}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{cls.name}</h4>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-white/5 text-xs">{cls.level}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {cls.students} alunos
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ClipboardList className="w-4 h-4 mr-2" /> Detalhes
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Notifications */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Aptos a Graduar
          </h3>
          <Card className="bg-[#111114]/30 border-white/5">
            <CardContent className="p-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors flex items-center gap-4 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">Aluno Exemplo {i}</p>
                    <p className="text-xs text-muted-foreground">98% de Frequência • Faixa Branca para Azul</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfessorDashboard;