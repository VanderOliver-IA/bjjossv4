import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Search, Filter, Clock, User, Building2, Terminal, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
    id: string;
    created_at: string;
    action: string;
    table_name: string;
    user_id: string;
    ct_id: string;
    record_id: string;
    new_data: any;
    old_data: any;
    profiles?: {
        name: string;
    };
    cts?: {
        name: string;
    };
}

const GlobalLogs = () => {
    const { role } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, [filterAction]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('audit_logs')
                .select(`
          *,
          profiles:user_id(name),
          cts:ct_id(name)
        `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (filterAction !== 'all') {
                query = query.eq('action', filterAction);
            }

            const { data, error } = await query;

            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.cts?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="border-primary/30 text-primary font-bold bg-primary/5 uppercase tracking-tighter px-3">
                        <Terminal className="w-3 h-3 mr-1" />
                        System Audit
                    </Badge>
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                        Logs Globais
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium max-w-2xl">
                        Rastreabilidade total das ações no ecossistema. <span className="text-white/60">Monitore alterações, acessos e eventos críticos em tempo real.</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-2 rounded-2xl flex items-center gap-2 shadow-premium">
                        <div className="px-4 py-2 border-r border-white/5 text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Logs</p>
                            <p className="text-primary font-black text-lg leading-none">{logs.length}</p>
                        </div>
                        <div className="px-4 py-2 text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                            <p className="text-success font-black text-lg leading-none flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                Live
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group md:col-span-2">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Pesquisar por ação, tabela, usuário ou CT..."
                        className="h-16 pl-14 bg-white/[0.02] border-white/5 rounded-[24px] text-lg font-medium focus:border-primary/50 transition-all placeholder:text-white/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="h-16 bg-white/[0.02] border-white/5 rounded-[24px] text-lg font-medium focus:border-primary/50">
                        <div className="flex items-center gap-3">
                            <Filter className="w-5 h-5 text-primary" />
                            <SelectValue placeholder="Filtrar Ação" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#111114] border-white/10 rounded-2xl">
                        <SelectItem value="all">Todas as Ações</SelectItem>
                        <SelectItem value="INSERT">Criação (INSERT)</SelectItem>
                        <SelectItem value="UPDATE">Edição (UPDATE)</SelectItem>
                        <SelectItem value="DELETE">Exclusão (DELETE)</SelectItem>
                        <SelectItem value="LOGIN">Acesso (LOGIN)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Logs Matrix */}
            <Card className="bg-[#111114]/50 backdrop-blur-3xl border-white/5 rounded-[40px] shadow-premium overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/[0.02]">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horário</TableHead>
                            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Centro de Treinamento</TableHead>
                            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Usuário</TableHead>
                            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ação</TableHead>
                            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recurso/Tabela</TableHead>
                            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-32 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-50">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <p className="font-black text-xs uppercase tracking-widest">Acessando Arquivos de Sistema...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredLogs.length > 0 ? filteredLogs.map((log) => (
                            <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <TableCell className="py-6 px-8">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-primary opacity-50" />
                                        <span className="text-white/80 font-medium">{format(new Date(log.created_at), "HH:mm:ss", { locale: ptBR })}</span>
                                        <span className="text-muted-foreground text-[10px] font-bold">{format(new Date(log.created_at), "dd MMM", { locale: ptBR })}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 px-8">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-bold text-white tracking-tight">{log.cts?.name || 'Sistema Global'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 px-8">
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-bold text-white tracking-tight">{log.profiles?.name || 'Sistema'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 px-8">
                                    <Badge className={cn(
                                        "font-black text-[10px] tracking-widest uppercase py-1 px-3",
                                        log.action === 'INSERT' && "bg-success/20 text-success border-success/30",
                                        log.action === 'UPDATE' && "bg-primary/20 text-primary border-primary/30",
                                        log.action === 'DELETE' && "bg-destructive/20 text-destructive border-destructive/30",
                                        log.action === 'LOGIN' && "bg-secondary/20 text-secondary border-secondary/30"
                                    )}>
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-6 px-8">
                                    <code className="bg-white/5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/50 border border-white/5">
                                        {log.table_name}
                                    </code>
                                </TableCell>
                                <TableCell className="py-6 px-8 text-right">
                                    <button className="p-2 rounded-xl bg-white/5 hover:bg-primary hover:text-black transition-all group-hover:scale-110">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="py-32 text-center">
                                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Nenhum log encontrado para esta busca.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default GlobalLogs;
