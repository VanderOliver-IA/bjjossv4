import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/DevAuthContext';
import { 
  User, 
  Camera, 
  Calendar, 
  Award, 
  TrendingUp, 
  CreditCard,
  Trophy,
  Medal,
  Shield
} from 'lucide-react';
import ReportChart from '@/components/reports/ReportChart';

const beltLabels: Record<string, string> = {
  branca: 'Branca',
  azul: 'Azul',
  roxa: 'Roxa',
  marrom: 'Marrom',
  preta: 'Preta',
};

const beltColors: Record<string, string> = {
  branca: 'bg-white text-black border',
  azul: 'bg-bjj-azul text-white',
  roxa: 'bg-bjj-roxo text-white',
  marrom: 'bg-bjj-marrom text-white',
  preta: 'bg-black text-white',
};

const mockStudentData = {
  belt: 'azul',
  stripes: 2,
  startDate: '2022-03-15',
  totalPresences: 245,
  lastPresence: '2024-01-20',
  federated: true,
  competitions: [
    { name: 'Campeonato Estadual 2023', result: 'Ouro', category: 'Adulto Azul Médio' },
    { name: 'Copa Regional 2023', result: 'Prata', category: 'Adulto Azul Médio' },
  ],
  medals: { gold: 3, silver: 2, bronze: 1 },
  upcomingEvents: [
    { name: 'Campeonato Nacional 2024', date: '2024-03-15' },
    { name: 'Cerimônia de Graduação', date: '2024-02-28' },
  ],
};

const presenceData = [
  { name: 'Jan', value: 18 },
  { name: 'Fev', value: 22 },
  { name: 'Mar', value: 20 },
  { name: 'Abr', value: 25 },
  { name: 'Mai', value: 23 },
  { name: 'Jun', value: 28 },
];

const Perfil = () => {
  const { profile, role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const isStudent = role === 'aluno';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
        <Button 
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
              {isEditing && (
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{profile?.name || 'Usuário'}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              {isStudent && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                  <Badge className={beltColors[mockStudentData.belt]}>
                    Faixa {beltLabels[mockStudentData.belt]}
                  </Badge>
                  <Badge variant="outline">
                    {mockStudentData.stripes} grau{mockStudentData.stripes !== 1 ? 's' : ''}
                  </Badge>
                  {mockStudentData.federated && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Federado
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          {isStudent && (
            <>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              <TabsTrigger value="competitions">Competições</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo</Label>
                  <Input 
                    value={profile?.name || ''} 
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={profile?.email || ''} 
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input 
                    value={profile?.phone || ''} 
                    placeholder="(00) 00000-0000"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input 
                    type="date"
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              {isStudent && (
                <>
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-4">Informações do Jiu-Jitsu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Data de Início no Jiu-Jitsu</Label>
                        <Input 
                          type="date"
                          value={mockStudentData.startDate}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>CT Anterior</Label>
                        <Input 
                          placeholder="Informe se treinou em outro CT"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isStudent && (
          <>
            <TabsContent value="stats" className="mt-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Total de Presenças
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStudentData.totalPresences}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-bjj-azul" />
                      Média Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">22</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Award className="h-4 w-4 text-bjj-roxo" />
                      Tempo de Faixa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">14 meses</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Medalhas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStudentData.medals.gold + mockStudentData.medals.silver + mockStudentData.medals.bronze}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Presence Chart */}
              <ReportChart title="Evolução de Presenças" data={presenceData} defaultType="line" />
            </TabsContent>

            <TabsContent value="competitions" className="mt-6 space-y-6">
              {/* Medal Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Medalhas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-around">
                    <div className="text-center">
                      <Medal className="h-12 w-12 mx-auto text-yellow-500" />
                      <p className="text-2xl font-bold mt-2">{mockStudentData.medals.gold}</p>
                      <p className="text-sm text-muted-foreground">Ouro</p>
                    </div>
                    <div className="text-center">
                      <Medal className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-2xl font-bold mt-2">{mockStudentData.medals.silver}</p>
                      <p className="text-sm text-muted-foreground">Prata</p>
                    </div>
                    <div className="text-center">
                      <Medal className="h-12 w-12 mx-auto text-amber-700" />
                      <p className="text-2xl font-bold mt-2">{mockStudentData.medals.bronze}</p>
                      <p className="text-sm text-muted-foreground">Bronze</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Competition History */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Competições</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStudentData.competitions.map((comp, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{comp.name}</p>
                          <p className="text-sm text-muted-foreground">{comp.category}</p>
                        </div>
                        <Badge className={comp.result === 'Ouro' ? 'bg-yellow-500' : comp.result === 'Prata' ? 'bg-gray-400' : 'bg-amber-700'}>
                          {comp.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming */}
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Competições</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStudentData.upcomingEvents.map((event, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Inscrever-se</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Histórico de Graduações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Badge className={beltColors['azul']}>Azul</Badge>
                        <div>
                          <p className="font-medium">Faixa Branca → Azul</p>
                          <p className="text-sm text-muted-foreground">Cerimônia de Graduação 2023</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">15/06/2023</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Badge className={beltColors['branca']}>Branca</Badge>
                        <div>
                          <p className="font-medium">4° Grau</p>
                          <p className="text-sm text-muted-foreground">Avaliação Trimestral</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">20/03/2023</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Perfil;
