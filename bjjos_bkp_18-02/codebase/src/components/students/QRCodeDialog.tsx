import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Printer, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QRCodeDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: string;
    studentName: string;
}

const QRCodeDialog = ({ isOpen, onOpenChange, studentId, studentName }: QRCodeDialogProps) => {
    const qrData = `bjjoss://checkin/${studentId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=3b82f6&bgcolor=0a0a0b`;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `qrcode-${studentName.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-[#0A0A0B] border-white/10 rounded-[40px] shadow-premium p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] -mr-16 -mt-16" />

                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-primary/20 rounded-3xl border border-primary/30 shadow-neon">
                            <QrCode className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <DialogTitle className="text-3xl font-black tracking-tighter text-white mb-2">QR Code de Check-in</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-lg">
                        Apresente este código para realizar o check-in na aula.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-8 py-8 relative z-10">
                    <div className="bg-white p-4 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.2)] border border-primary/20 transition-transform hover:scale-105 duration-500">
                        <img
                            src={qrUrl}
                            alt="Student QR Code"
                            className="w-64 h-64 rounded-xl"
                        />
                    </div>

                    <div className="text-center">
                        <h4 className="text-xl font-bold text-white mb-1">{studentName}</h4>
                        <Badge variant="outline" className="border-white/10 text-muted-foreground bg-white/5 uppercase tracking-widest text-[10px] py-1 px-4">
                            ID: {studentId.slice(0, 8)}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 relative z-10">
                    <Button
                        className="h-14 rounded-2xl font-bold gap-2 text-black bg-primary hover:bg-primary/90"
                        onClick={handleDownload}
                    >
                        <Download className="w-5 h-5" />
                        Download
                    </Button>
                    <Button
                        variant="outline"
                        className="h-14 rounded-2xl font-bold gap-2 bg-white/5 border-white/10 hover:bg-white/10"
                        onClick={() => window.print()}
                    >
                        <Printer className="w-5 h-5" />
                        Imprimir
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QRCodeDialog;
