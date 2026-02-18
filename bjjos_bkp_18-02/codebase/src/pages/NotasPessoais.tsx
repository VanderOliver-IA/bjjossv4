import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Pin, Trash2, Edit3, MoreVertical, StickyNote, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import PageFallback from '@/components/ui/page-fallback';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

const NOTE_COLORS = [
  { value: 'default', label: 'Padrão', class: 'bg-card border-border' },
  { value: 'yellow', label: 'Amarelo', class: 'bg-warning/10 border-warning/30' },
  { value: 'blue', label: 'Azul', class: 'bg-primary/10 border-primary/30' },
  { value: 'purple', label: 'Roxo', class: 'bg-secondary/10 border-secondary/30' },
  { value: 'green', label: 'Verde', class: 'bg-success/10 border-success/30' },
];

const NotasPessoais = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', color: 'default' });

  const fetchNotes = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('personal_notes')
        .select('*')
        .eq('profile_id', profile.id)
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Erro ao carregar notas');
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSave = async () => {
    if (!profile?.id) return;

    try {
      if (editingNote) {
        const { error: updateError } = await supabase
          .from('personal_notes')
          .update({
            title: formData.title,
            content: formData.content,
            color: formData.color,
          })
          .eq('id', editingNote.id);

        if (updateError) throw updateError;
        toast({ title: 'Nota atualizada!' });
      } else {
        const { error: insertError } = await supabase
          .from('personal_notes')
          .insert({
            profile_id: profile.id,
            title: formData.title,
            content: formData.content,
            color: formData.color,
          });

        if (insertError) throw insertError;
        toast({ title: 'Nota criada!' });
      }

      setIsDialogOpen(false);
      setEditingNote(null);
      setFormData({ title: '', content: '', color: 'default' });
      fetchNotes();
    } catch (err) {
      console.error('Error saving note:', err);
      toast({ variant: 'destructive', title: 'Erro ao salvar nota' });
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('personal_notes')
        .delete()
        .eq('id', noteId);

      if (deleteError) throw deleteError;
      toast({ title: 'Nota excluída!' });
      fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
      toast({ variant: 'destructive', title: 'Erro ao excluir nota' });
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      const { error: updateError } = await supabase
        .from('personal_notes')
        .update({ pinned: !note.pinned })
        .eq('id', note.id);

      if (updateError) throw updateError;
      fetchNotes();
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content, color: note.color });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingNote(null);
    setFormData({ title: '', content: '', color: 'default' });
    setIsDialogOpen(true);
  };

  const getColorClass = (color: string) => {
    return NOTE_COLORS.find(c => c.value === color)?.class || NOTE_COLORS[0].class;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <PageFallback type="error" title={error} onRetry={fetchNotes} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lock className="h-7 w-7 text-primary" />
            Notas Pessoais
          </h1>
          <p className="text-muted-foreground">
            Suas anotações privadas — apenas você pode ver
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Editar Nota' : 'Nova Nota'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Título (opcional)"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Escreva sua nota aqui..."
                rows={6}
                value={formData.content}
                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              />
              <div className="flex gap-2">
                {NOTE_COLORS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color.class} ${
                      formData.color === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!formData.content.trim()}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <StickyNote className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma nota ainda</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira nota pessoal para guardar observações, lembretes ou qualquer coisa.
            </p>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Nota
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <Card
              key={note.id}
              className={`relative transition-all hover:shadow-md ${getColorClass(note.color)}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {note.pinned && <Pin className="h-4 w-4 text-primary shrink-0" />}
                    <CardTitle className="text-base truncate">
                      {note.title || 'Sem título'}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(note)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePin(note)}>
                        <Pin className="h-4 w-4 mr-2" />
                        {note.pinned ? 'Desafixar' : 'Fixar'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(note.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {note.content}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(note.updated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotasPessoais;
