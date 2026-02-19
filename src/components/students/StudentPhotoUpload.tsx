import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, Check, RotateCcw, User, UserSquare2, UserCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoSectionProps {
    label: string;
    icon: any;
    onCapture: (file: File) => void;
}

const PhotoSection = ({ label, icon: Icon, onCapture }: PhotoSectionProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
            onCapture(file);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 text-center">{label}</p>
            <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all ${preview ? 'border-green-500 bg-green-500/5' : 'border-slate-800 bg-slate-900/50 hover:border-blue-500/50'}`}
            >
                {preview ? (
                    <img src={preview} alt={label} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center p-4">
                        <Icon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="text-[10px] text-slate-500 font-medium">Clique para tirar<br />foto ou enviar</p>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileChange}
                />
                {preview && (
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>
        </div>
    );
};

export function StudentPhotoUpload() {
    const { toast } = useToast();
    const [photos, setPhotos] = useState<{ front?: File, left?: File, right?: File }>({});

    const isComplete = photos.front && photos.left && photos.right;

    const handleSave = () => {
        if (!isComplete) {
            toast({
                variant: "destructive",
                title: "Fotos obrigatórias",
                description: "Envie as 3 fotos para continuar (Frente, Esquerda e Direita)."
            });
            return;
        }
        toast({
            title: "Biometria atualizada!",
            description: "As fotos foram processadas com sucesso."
        });
    };

    return (
        <Card className="bg-[#0f172a] border-slate-800 shadow-2xl">
            <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-1">
                    <h3 className="font-bold text-lg text-white">Biometria Facial</h3>
                    <p className="text-sm text-slate-400">As 3 fotos são obrigatórias para o reconhecimento.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <PhotoSection
                        label="Frente"
                        icon={UserCircle2}
                        onCapture={(file) => setPhotos(prev => ({ ...prev, front: file }))}
                    />
                    <PhotoSection
                        label="Perfil Esq."
                        icon={UserSquare2}
                        onCapture={(file) => setPhotos(prev => ({ ...prev, left: file }))}
                    />
                    <PhotoSection
                        label="Perfil Dir."
                        icon={User}
                        onCapture={(file) => setPhotos(prev => ({ ...prev, right: file }))}
                    />
                </div>

                <Button
                    onClick={handleSave}
                    className={`w-full h-12 font-bold rounded-xl transition-all ${isComplete ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-800 text-slate-500'}`}
                >
                    {isComplete ? 'Salvar Fotos de Aluno' : 'Aguardando 3 Fotos...'}
                </Button>

                <p className="text-[10px] text-center text-slate-500">
                    🔒 Os dados de biometria são criptografados seguindo a LGPD.
                </p>
            </CardContent>
        </Card>
    );
}
