import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Flag, Search, Building2, Check, X, Edit2 } from 'lucide-react';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  ctIds: string[];
  createdAt: string;
}

const mockFlags: FeatureFlag[] = [
  { 
    id: '1', 
    name: 'facial_recognition', 
    description: 'Habilita reconhecimento facial para presença',
    enabled: true,
    ctIds: [],
    createdAt: '2024-01-01'
  },
  { 
    id: '2', 
    name: 'pix_integration', 
    description: 'Integração com pagamentos via Pix',
    enabled: false,
    ctIds: ['1', '2'],
    createdAt: '2024-01-05'
  },
  { 
    id: '3', 
    name: 'whatsapp_notifications', 
    description: 'Notificações automáticas via WhatsApp',
    enabled: true,
    ctIds: [],
    createdAt: '2024-01-10'
  },
  { 
    id: '4', 
    name: 'advanced_reports', 
    description: 'Relatórios avançados com exportação PDF',
    enabled: true,
    ctIds: ['1'],
    createdAt: '2024-01-15'
  },
  { 
    id: '5', 
    name: 'competition_module', 
    description: 'Módulo de gestão de competições',
    enabled: false,
    ctIds: [],
    createdAt: '2024-01-20'
  },
];

const FeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFlags);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  const filteredFlags = flags.filter(flag =>
    flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFlag = (flagId: string) => {
    setFlags(prev => prev.map(flag =>
      flag.id === flagId ? { ...flag, enabled: !flag.enabled } : flag
    ));
  };

  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground">Controle de funcionalidades do sistema</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Flag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Feature Flag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome (identificador)</Label>
                <Input placeholder="nome_da_feature" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea placeholder="Descrição da funcionalidade..." />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="enabled" />
                <Label htmlFor="enabled">Ativar para todos os CTs</Label>
              </div>
              <Button className="w-full" onClick={() => setIsAddOpen(false)}>
                Criar Flag
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ativas Globalmente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{enabledCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {flags.length - enabledCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Por CT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bjj-azul">
              {flags.filter(f => f.ctIds.length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar flags..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingFlag} onOpenChange={() => setEditingFlag(null)}>
        <DialogContent>
          {editingFlag && (
            <>
              <DialogHeader>
                <DialogTitle>Editar Feature Flag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={editingFlag.name} disabled />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea value={editingFlag.description} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="edit-enabled" checked={editingFlag.enabled} />
                  <Label htmlFor="edit-enabled">Ativa para todos</Label>
                </div>
                {!editingFlag.enabled && (
                  <div>
                    <Label>CTs específicos (IDs separados por vírgula)</Label>
                    <Input 
                      value={editingFlag.ctIds.join(', ')} 
                      placeholder="1, 2, 3"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => setEditingFlag(null)}>
                    Salvar Alterações
                  </Button>
                  <Button variant="destructive" onClick={() => setEditingFlag(null)}>
                    Excluir
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Flags List */}
      <div className="space-y-4">
        {filteredFlags.map(flag => (
          <Card key={flag.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    flag.enabled ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Flag className={`h-6 w-6 ${flag.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-medium">{flag.name}</code>
                      {flag.enabled ? (
                        <Badge className="bg-primary">
                          <Check className="h-3 w-3 mr-1" /> Ativa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <X className="h-3 w-3 mr-1" /> Inativa
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                    {flag.ctIds.length > 0 && !flag.enabled && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        Ativa para {flag.ctIds.length} CT{flag.ctIds.length !== 1 ? 's' : ''} específico{flag.ctIds.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Switch 
                    checked={flag.enabled} 
                    onCheckedChange={() => toggleFlag(flag.id)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setEditingFlag(flag)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeatureFlags;
