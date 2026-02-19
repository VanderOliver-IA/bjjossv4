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

export function AddStudentDialog() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulação de delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Aluno cadastrado!",
            description: "O aluno foi adicionado ao sistema com sucesso.",
        });

        setLoading(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="btn-presence text-white cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Aluno
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                    <DialogDescription>
                        Preencha os dados básicos do aluno. O cadastro completo pode ser feito depois pelo próprio aluno via link.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nome
                        </Label>
                        <Input id="name" placeholder="João da Silva" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input id="email" type="email" placeholder="joao@exemplo.com" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            WhatsApp
                        </Label>
                        <Input id="phone" placeholder="(11) 99999-9999" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="belt" className="text-right">
                            Faixa
                        </Label>
                        <Select defaultValue="branca">
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione a faixa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="branca">Branca</SelectItem>
                                <SelectItem value="azul">Azul</SelectItem>
                                <SelectItem value="roxa">Roxa</SelectItem>
                                <SelectItem value="marrom">Marrom</SelectItem>
                                <SelectItem value="preta">Preta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Cadastrar Aluno'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
