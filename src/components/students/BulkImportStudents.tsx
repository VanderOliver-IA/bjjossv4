import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CsvStudent {
    name: string;
    email: string;
    phone: string;
    belt: string;
    stripes: number;
    birth_date?: string;
    enrollment_date?: string;
    status: string;
}

export function BulkImportStudents() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<CsvStudent[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [importResults, setImportResults] = useState<{ success: number; errors: number } | null>(null);
    const { toast } = useToast();
    const { viewAsCT, profile } = useAuth();

    const activeCtId = viewAsCT || profile?.ct_id;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        // Parse to preview
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Formata os dados para garantir os tipos
                const data = results.data.map((row: any) => ({
                    name: row.name || 'Sem nome',
                    email: row.email || `sem-email-${Date.now()}@exemplo.com`,
                    phone: row.phone || '0000000000',
                    belt: row.belt?.toLowerCase() || 'branca',
                    stripes: parseInt(row.stripes) || 0,
                    status: row.status?.toLowerCase() || 'ativo',
                    birth_date: row.birth_date || undefined,
                    enrollment_date: row.enrollment_date || new Date().toISOString().split('T')[0],
                }));
                setPreviewData(data as CsvStudent[]);
                setImportResults(null);
            }
        });
    };

    const handleImport = async () => {
        if (!activeCtId) {
            toast({ title: "Erro", description: "Nenhum CT selecionado.", variant: "destructive" });
            return;
        }

        if (previewData.length === 0) return;

        setIsProcessing(true);
        let successCount = 0;
        let errorCount = 0;

        // Batches de inserção
        const batchSize = 10;
        for (let i = 0; i < previewData.length; i += batchSize) {
            const batch = previewData.slice(i, i + batchSize);

            const { error } = await supabase
                .from('students')
                .insert(batch.map(s => ({
                    ct_id: activeCtId,
                    name: s.name,
                    email: s.email,
                    phone: s.phone,
                    belt: s.belt as any,
                    stripes: s.stripes,
                    status: s.status as any,
                    birth_date: s.birth_date,
                    enrollment_date: s.enrollment_date || new Date().toISOString().split('T')[0],
                    balance: 0,
                })));

            if (error) {
                console.error("Erro no batch:", error);
                errorCount += batch.length;
            } else {
                successCount += batch.length;
            }

            setProgress(Math.round(((i + batchSize) / previewData.length) * 100));
        }

        setImportResults({ success: successCount, errors: errorCount });
        setIsProcessing(false);
        setProgress(100);

        if (errorCount === 0) {
            toast({ title: "Sucesso!", description: `${successCount} alunos importados.` });
        } else {
            toast({ title: "Importação concluída com erros", description: `${successCount} sucesso, ${errorCount} erros.` });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setFile(null);
                setPreviewData([]);
                setImportResults(null);
                setProgress(0);
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 cursor-pointer bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 font-bold">
                    <UploadCloud className="w-4 h-4" /> Importar CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-[#111114] text-white border-white/5">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Importação em Lote</DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium">
                        Faça upload de uma planilha .CSV para cadastrar dezenas de alunos instantaneamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    {!file && (
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all" onClick={() => document.getElementById('csv-upload')?.click()}>
                            <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                            <div className="bg-primary/20 p-4 rounded-full mb-4">
                                <FileType className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg">Clique para arrastar o CSV</h3>
                            <p className="text-xs text-muted-foreground mt-2 max-w-[250px]">Colunas esperadas: name, email, phone, belt, stripes, status, birth_date, enrollment_date</p>
                        </div>
                    )}

                    {file && !isProcessing && !importResults && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <FileType className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{previewData.length} registros encontrados</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Trocar arquivo</Button>
                            </div>

                            <div className="border border-white/5 rounded-xl overflow-hidden">
                                <div className="bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-white/5">
                                    Pré-visualização (Primeiros {Math.min(3, previewData.length)})
                                </div>
                                <ScrollArea className="h-[150px]">
                                    {previewData.slice(0, 3).map((s, i) => (
                                        <div key={i} className="px-4 py-3 border-b border-white/5 flex flex-col gap-1 text-sm">
                                            <div className="font-bold text-white">{s.name} <Badge variant="outline" className="ml-2 text-[10px] h-5">{s.belt}</Badge></div>
                                            <div className="text-xs text-muted-foreground flex justify-between">
                                                <span>{s.email}</span>
                                                <span>{s.phone}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {previewData.length > 3 && (
                                        <div className="p-3 text-center text-xs text-muted-foreground italic bg-white/5">
                                            + {previewData.length - 3} registros...
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleImport} className="w-full font-black uppercase tracking-widest bg-primary hover:bg-primary/90">
                                    <UploadCloud className="w-4 h-4 mr-2" />
                                    Confirmar Importação de {previewData.length} Alunos
                                </Button>
                            </div>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <div className="space-y-2 w-full max-w-[80%]">
                                <h3 className="font-bold text-lg">Importando alunos...</h3>
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">{progress}% completo</p>
                            </div>
                        </div>
                    )}

                    {importResults && (
                        <div className="py-6 flex flex-col items-center text-center space-y-4">
                            {importResults.errors === 0 ? (
                                <div className="bg-green-500/20 p-4 rounded-full mb-2">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                            ) : (
                                <div className="bg-yellow-500/20 p-4 rounded-full mb-2">
                                    <AlertCircle className="w-12 h-12 text-yellow-500" />
                                </div>
                            )}

                            <h3 className="font-black text-2xl tracking-tight">Resultado</h3>
                            <div className="flex gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-[120px]">
                                    <p className="text-3xl font-black text-green-500">{importResults.success}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Sucesso</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-[120px]">
                                    <p className="text-3xl font-black text-destructive">{importResults.errors}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Erros</p>
                                </div>
                            </div>
                            <Button onClick={() => setOpen(false)} className="mt-4 w-full" variant="outline">Concluir</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
