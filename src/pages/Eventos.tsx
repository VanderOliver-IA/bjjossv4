import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, MapPin, Trophy, Users, GraduationCap, Star } from 'lucide-react';
import DateRangeFilter, { DateRange, getDateRangeForPeriod } from '@/components/reports/DateRangeFilter';

type EventType = 'graduacao' | 'campeonato' | 'interno' | 'seminario';

interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string;
  description?: string;
  location?: string;
  price?: number;
  participants: number;
}

const mockEvents: Event[] = [
  { id: '1', title: 'Cerimônia de Graduação 2024', type: 'graduacao', date: '2024-02-15', location: 'CT Principal', participants: 25 },
  { id: '2', title: 'Campeonato Estadual', type: 'campeonato', date: '2024-03-10', location: 'Ginásio Municipal', price: 80, participants: 12 },
  { id: '3', title: 'Treino Aberto', type: 'interno', date: '2024-02-20', description: 'Treino especial com todos os professores', participants: 40 },
  { id: '4', title: 'Seminário com Mestre Visitante', type: 'seminario', date: '2024-04-05', location: 'CT Principal', price: 150, participants: 30 },
];

const typeLabels: Record<EventType, string> = {
  graduacao: 'Graduação',
  campeonato: 'Campeonato',
  interno: 'Evento Interno',
  seminario: 'Seminário',
};

const typeIcons: Record<EventType, React.ReactNode> = {
  graduacao: <GraduationCap className="h-5 w-5" />,
  campeonato: <Trophy className="h-5 w-5" />,
  interno: <Users className="h-5 w-5" />,
  seminario: <Star className="h-5 w-5" />,
};

const typeColors: Record<EventType, string> = {
  graduacao: 'bg-bjj-azul text-white',
  campeonato: 'bg-bjj-roxo text-white',
  interno: 'bg-bjj-marrom text-white',
  seminario: 'bg-primary text-primary-foreground',
};

const Eventos = () => {
  const [events] = useState<Event[]>(mockEvents);
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeForPeriod('30days'));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredEvents = events.filter(event => 
    selectedType === 'all' || event.type === selectedType
  );

  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date());
  const pastEvents = filteredEvents.filter(e => new Date(e.date) < new Date());

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
      <CardContent className="pt-4">
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${typeColors[event.type]}`}>
            {typeIcons[event.type]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <Badge variant="outline" className="mt-1">{typeLabels[event.type]}</Badge>
              </div>
              {event.price && (
                <span className="font-bold text-primary">
                  R$ {event.price.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(event.date).toLocaleDateString('pt-BR')}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.participants} participantes
              </span>
            </div>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">Gerencie graduações, campeonatos e eventos</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input placeholder="Nome do evento" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select defaultValue="interno">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Local</Label>
                <Input placeholder="Endereço ou local" />
              </div>
              <div>
                <Label>Valor (opcional)</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea placeholder="Detalhes do evento..." />
              </div>
              <Button className="w-full" onClick={() => setIsAddOpen(false)}>
                Criar Evento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Próximos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Graduações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bjj-azul">
              {events.filter(e => e.type === 'graduacao').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Campeonatos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bjj-roxo">
              {events.filter(e => e.type === 'campeonato').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Próximos ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Realizados ({pastEvents.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
          {upcomingEvents.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum evento próximo
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="past" className="space-y-4 mt-4">
          {pastEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
          {pastEvents.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum evento realizado
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Eventos;
