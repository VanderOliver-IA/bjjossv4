import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Users, 
  Plus, 
  Search, 
  Check, 
  CheckCheck,
  Phone
} from 'lucide-react';

interface Message {
  id: string;
  from: string;
  to?: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
  type: 'received' | 'sent' | 'announcement';
}

const mockMessages: Message[] = [
  { id: '1', from: 'Admin', to: 'Todos', subject: 'Aviso: Treino especial sábado', content: 'Teremos treino especial neste sábado às 10h com presença confirmada do mestre visitante.', read: false, createdAt: '2024-01-20T10:00:00', type: 'announcement' },
  { id: '2', from: 'João Silva', subject: 'Dúvida sobre mensalidade', content: 'Olá, gostaria de saber se posso parcelar a mensalidade deste mês.', read: true, createdAt: '2024-01-19T15:30:00', type: 'received' },
  { id: '3', from: 'Admin', to: 'Maria Santos', subject: 'Re: Atestado médico', content: 'Maria, recebemos seu atestado. Sua mensalidade será ajustada.', read: true, createdAt: '2024-01-18T09:00:00', type: 'sent' },
  { id: '4', from: 'Pedro Costa', subject: 'Inscrição campeonato', content: 'Gostaria de confirmar minha inscrição no campeonato estadual.', read: false, createdAt: '2024-01-17T14:20:00', type: 'received' },
];

const Comunicacao = () => {
  const [messages] = useState<Message[]>(mockMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const unreadCount = messages.filter(m => !m.read && m.type === 'received').length;
  const receivedMessages = messages.filter(m => m.type === 'received');
  const sentMessages = messages.filter(m => m.type === 'sent');
  const announcements = messages.filter(m => m.type === 'announcement');

  const filteredMessages = (list: Message[]) => 
    list.filter(m => 
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.from.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const MessageCard = ({ message, onClick }: { message: Message; onClick: () => void }) => (
    <Card 
      className={`cursor-pointer transition-colors hover:border-primary/50 ${!message.read ? 'bg-primary/5 border-primary/20' : ''}`}
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {!message.read && <div className="w-2 h-2 rounded-full bg-primary" />}
              <h3 className="font-medium truncate">{message.subject}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {message.type === 'sent' ? `Para: ${message.to}` : `De: ${message.from}`}
            </p>
            <p className="text-sm text-muted-foreground truncate mt-1">{message.content}</p>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(message.createdAt).toLocaleDateString('pt-BR')}
            <div className="flex justify-end mt-1">
              {message.type === 'sent' && (
                message.read ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Comunicação</h1>
          <p className="text-muted-foreground">Mensagens e avisos do CT</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova Mensagem</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Destinatário</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o destinatário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os alunos</SelectItem>
                      <SelectItem value="active">Alunos ativos</SelectItem>
                      <SelectItem value="late">Alunos inadimplentes</SelectItem>
                      <SelectItem value="individual">Aluno específico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assunto</Label>
                  <Input placeholder="Assunto da mensagem" />
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea 
                    placeholder="Digite sua mensagem..." 
                    className="min-h-32"
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2">
                    <Send className="h-4 w-4" />
                    Enviar pelo Sistema
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recebidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receivedMessages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentMessages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar mensagens..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent>
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {selectedMessage.type === 'sent' 
                      ? `Para: ${selectedMessage.to}` 
                      : `De: ${selectedMessage.from}`}
                  </span>
                  <span>{new Date(selectedMessage.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
                {selectedMessage.type === 'received' && (
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Responder
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Phone className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Messages Tabs */}
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Recebidas
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            Enviadas
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-2">
            <Bell className="h-4 w-4" />
            Avisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4 mt-4">
          {filteredMessages(receivedMessages).map(message => (
            <MessageCard 
              key={message.id} 
              message={message} 
              onClick={() => setSelectedMessage(message)}
            />
          ))}
          {filteredMessages(receivedMessages).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma mensagem recebida
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4 mt-4">
          {filteredMessages(sentMessages).map(message => (
            <MessageCard 
              key={message.id} 
              message={message} 
              onClick={() => setSelectedMessage(message)}
            />
          ))}
          {filteredMessages(sentMessages).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma mensagem enviada
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4 mt-4">
          {filteredMessages(announcements).map(message => (
            <MessageCard 
              key={message.id} 
              message={message} 
              onClick={() => setSelectedMessage(message)}
            />
          ))}
          {filteredMessages(announcements).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum aviso publicado
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Comunicacao;
