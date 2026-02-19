import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

export function AddClassDialog() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        toast({
            title: "Turma criada!",
            description: "A nova turma foi adicionada ao cronograma.",
        });

        setLoading(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="btn-presence text-white cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Turma
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nova Turma</DialogTitle>
                    <DialogDescription>
                        Configure os horários e nível da nova turma.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nome</Label>
                        <Input id="name" placeholder="Jiu-Jitsu Introdutório" className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="level" className="text-right">Nível</Label>
                        <Select>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="iniciante">Iniciante (Branca)</SelectItem>
                                <SelectItem value="intermediario">Intermediário (Azul/Roxa)</SelectItem>
                                <SelectItem value="avancado">Avançado (Marrom/Preta)</SelectItem>
                                <SelectItem value="todos">Todos os Níveis</SelectItem>
                                <SelectItem value="kids">Kids</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="professor" className="text-right">Professor</Label>
                        <Input id="professor" placeholder="Nome do Professor" className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Dias</Label>
                        <div className="col-span-3 flex flex-wrap gap-2">
                            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                                <div key={day} className="flex items-center space-x-2 border p-2 rounded hover:bg-muted/50 cursor-pointer">
                                    <Checkbox id={`day-${day}`} />
                                    <label htmlFor={`day-${day}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                        {day}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">Horário</Label>
                        <div className="col-span-3 flex gap-2">
                            <Input type="time" className="w-32" required />
                            <span className="self-center">às</span>
                            <Input type="time" className="w-32" required />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Salvar Turma'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
