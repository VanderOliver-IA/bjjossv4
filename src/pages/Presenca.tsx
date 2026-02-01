import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  User, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  UserPlus,
} from 'lucide-react';
import { mockStudents, mockClasses } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PresenceStep = 'select' | 'capture' | 'processing' | 'results' | 'confirm';

interface RecognizedFace {
  id: string;
  name: string;
  belt: string;
  photo: string;
  confidence: number;
  status: 'recognized' | 'unknown';
}

const Presenca = () => {
  const [step, setStep] = useState<PresenceStep>('select');
  const [selectedClass, setSelectedClass] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [recognizedFaces, setRecognizedFaces] = useState<RecognizedFace[]>([]);

  const simulateProcessing = () => {
    setStep('processing');
    setProcessingProgress(0);
    
    // Simulate processing stages
    const stages = [
      { progress: 20, text: 'Otimizando imagem...' },
      { progress: 50, text: 'Detectando rostos...' },
      { progress: 80, text: 'Comparando com alunos cadastrados...' },
      { progress: 100, text: 'Concluído!' },
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setProcessingProgress(stages[currentStage].progress);
        setProcessingStage(stages[currentStage].text);
        currentStage++;
      } else {
        clearInterval(interval);
        // Simulate recognized faces
        const simulatedFaces: RecognizedFace[] = [
          ...mockStudents.slice(0, 5).map(s => ({
            id: s.id,
            name: s.name,
            belt: s.belt,
            photo: s.photoFront,
            confidence: 85 + Math.random() * 15,
            status: 'recognized' as const,
          })),
          {
            id: 'unknown1',
            name: 'Pessoa não identificada',
            belt: '',
            photo: 'https://randomuser.me/api/portraits/men/99.jpg',
            confidence: 0,
            status: 'unknown' as const,
          },
        ];
        setRecognizedFaces(simulatedFaces);
        setStep('results');
      }
    }, 800);
  };

  const handleCapture = (type: 'group' | 'upload' | 'individual') => {
    if (!selectedClass) return;
    simulateProcessing();
  };

  const renderStep = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-6">
            {/* Class Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Selecione a Turma</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma turma..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClasses.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.schedule}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Capture Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${selectedClass ? 'hover:border-primary' : 'opacity-50'}`}
                onClick={() => handleCapture('group')}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Tirar Foto (Grupo)</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture uma foto da turma inteira
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${selectedClass ? 'hover:border-primary' : 'opacity-50'}`}
                onClick={() => handleCapture('upload')}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2">Enviar Foto</h3>
                  <p className="text-sm text-muted-foreground">
                    Faça upload de uma foto existente
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${selectedClass ? 'hover:border-primary' : 'opacity-50'}`}
                onClick={() => handleCapture('individual')}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Foto Individual</h3>
                  <p className="text-sm text-muted-foreground">
                    Registre presença individualmente
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'processing':
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Processando Imagem</h3>
              <p className="text-muted-foreground mb-6">{processingStage}</p>
              <Progress value={processingProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">{processingProgress}%</p>
            </CardContent>
          </Card>
        );

      case 'results':
        return (
          <div className="space-y-6">
            {/* Recognized Faces */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Rostos Reconhecidos ({recognizedFaces.filter(f => f.status === 'recognized').length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {recognizedFaces.filter(f => f.status === 'recognized').map(face => (
                    <div key={face.id} className="text-center p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <img 
                        src={face.photo} 
                        alt={face.name}
                        className="w-16 h-16 mx-auto rounded-full object-cover mb-2"
                      />
                      <p className="font-medium text-sm truncate">{face.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{face.belt}</p>
                      <Badge className="mt-2 bg-green-500/10 text-green-500 text-xs">
                        {face.confidence.toFixed(0)}% match
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Unknown Faces */}
            {recognizedFaces.filter(f => f.status === 'unknown').length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Rostos Não Reconhecidos ({recognizedFaces.filter(f => f.status === 'unknown').length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {recognizedFaces.filter(f => f.status === 'unknown').map(face => (
                      <div key={face.id} className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <img 
                            src={face.photo} 
                            alt="Não identificado"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <p className="font-medium text-sm">Não identificado</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            Visitante
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Experimental
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Aluno Existente
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Outro
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setStep('select')}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button className="btn-presence text-white" onClick={() => setStep('confirm')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Presenças
              </Button>
            </div>
          </div>
        );

      case 'confirm':
        const recognized = recognizedFaces.filter(f => f.status === 'recognized').length;
        const unknown = recognizedFaces.filter(f => f.status === 'unknown').length;

        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Presença Registrada!</h3>
              <p className="text-muted-foreground mb-6">
                Os registros foram salvos com sucesso.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-2xl font-bold text-green-500">{recognized}</p>
                  <p className="text-xs text-muted-foreground">Presentes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">{unknown}</p>
                  <p className="text-xs text-muted-foreground">Visitantes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{recognized + unknown}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>

              <Button onClick={() => {
                setStep('select');
                setSelectedClass('');
                setRecognizedFaces([]);
              }}>
                Finalizar
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registrar Presença</h1>
        <p className="text-muted-foreground">Use o reconhecimento facial para registrar presenças</p>
      </div>

      {renderStep()}
    </div>
  );
};

export default Presenca;
