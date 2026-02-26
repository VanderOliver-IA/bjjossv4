import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Loader2, Send } from "lucide-react";

interface SendWhatsAppDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    studentName: string;
    studentPhone: string;
}

export function SendWhatsAppDialog({ isOpen, onOpenChange, studentName, studentPhone }: SendWhatsAppDialogProps) {
    const [message, setMessage] = useState(`Olá ${studentName}, tudo bem? 🥋`);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSend = async () => {
        setLoading(true);
        try {
            // Chamar n8n para disparo via Evolution API
            const response = await fetch('https://n8n.olamundodigital.cloud/webhook/bjjoss-send-msg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: studentPhone,
                    text: message,
                    evolution_instance: 'bjjoss' // Padrão
                })
            });

            if (!response.ok) throw new Error("Erro ao disparar mensagem");

            toast({
                title: "Mensagem Enviada! 🚀",
                description: `Seu WhatsApp para ${studentName} foi disparado via Evolution API.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro no disparo",
                description: "Verifique se a Evolution API está ativa no n8n."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0f172a] border-slate-800 text-white rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase italic tracking-tighter text-blue-500">
                        <Smartphone className="w-5 h-5 text-blue-500" />
                        Quick WhatsApp
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Destinatário</p>
                        <p className="font-bold">{studentName} <span className="text-blue-400 ml-2">({studentPhone})</span></p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mensagem</p>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-[#1e293b] border-slate-800 min-h-[120px] rounded-2xl focus:ring-blue-500 font-medium"
                            placeholder="Escreva sua mensagem aqui..."
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white rounded-xl">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={loading || !message}
                        className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 font-black gap-2 h-12 shadow-lg shadow-blue-900/20"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                        DISPARAR AGORA
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
