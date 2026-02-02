import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFacialRecognition } from '@/hooks/useFacialRecognition';

type PresenceStep = 'select' | 'capture' | 'processing' | 'results' | 'confirm';
type CaptureMode = 'camera' | 'upload';

interface TrainingClass {
  id: string;
  name: string;
  schedule: string | null;
  time_start: string | null;
  time_end: string | null;
}

interface RecognizedFace {
  student_id: string;
  student_name: string;
  confidence: number;
  matched: boolean;
  belt?: string;
  photo_url?: string;
}

const Presenca = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { isProcessing, recognizeFaces, recordAttendance } = useFacialRecognition();
  
  const ctId = profile?.ct_id;
  
  const [step, setStep] = useState<PresenceStep>('select');
  const [captureMode, setCaptureMode] = useState<CaptureMode | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [recognizedFaces, setRecognizedFaces] = useState<RecognizedFace[]>([]);
  const [unrecognizedCount, setUnrecognizedCount] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!ctId) return;
      
      const { data, error } = await supabase
        .from('training_classes')
        .select('id, name, schedule, time_start, time_end')
        .eq('ct_id', ctId)
        .eq('active', true);
      
      if (error) {
        console.error('Error fetching classes:', error);
        return;
      }
      
      setClasses(data || []);
    };
    
    fetchClasses();
  }, [ctId]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsCameraActive(true);
      setCapturedImage(null);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao acessar câmera',
        description: 'Verifique as permissões do navegador.',
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = imageData.split(',')[1];
    setCapturedImage(imageData);
    stopCamera();
    
    return base64;
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const processImage = async (imageBase64: string) => {
    if (!ctId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'CT não identificado.',
      });
      return;
    }

    setStep('processing');
    setProcessingProgress(0);

    // Simulate progress stages while waiting for AI
    const stages = [
      { progress: 20, text: 'Preparando imagem...' },
      { progress: 40, text: 'Enviando para análise...' },
      { progress: 60, text: 'Detectando rostos...' },
      { progress: 80, text: 'Comparando com alunos cadastrados...' },
    ];

    let stageIndex = 0;
    const progressInterval = setInterval(() => {
      if (stageIndex < stages.length) {
        setProcessingProgress(stages[stageIndex].progress);
        setProcessingStage(stages[stageIndex].text);
        stageIndex++;
      }
    }, 1000);

    try {
      const response = await recognizeFaces(imageBase64, ctId);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setProcessingStage('Concluído!');

      if (response) {
        // Fetch additional student info for display
        const studentIds = response.results.map(r => r.student_id);
        const { data: studentsInfo } = await supabase
          .from('students')
          .select('id, belt, photo_front')
          .in('id', studentIds);

        const enrichedResults = response.results.map(result => {
          const studentInfo = studentsInfo?.find(s => s.id === result.student_id);
          return {
            ...result,
            belt: studentInfo?.belt || '',
            photo_url: studentInfo?.photo_front || '',
          };
        });

        setRecognizedFaces(enrichedResults);
        setUnrecognizedCount(response.unrecognized_count);
        
        setTimeout(() => {
          setStep('results');
        }, 500);
      } else {
        setStep('select');
        setCapturedImage(null);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Processing error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no processamento',
        description: 'Falha ao processar a imagem. Tente novamente.',
      });
      setStep('select');
      setCapturedImage(null);
    }
  };

  const handleCaptureAndProcess = () => {
    const base64 = capturePhoto();
    if (base64) {
      processImage(base64);
    }
  };

  const handleUploadAndProcess = () => {
    if (!capturedImage) return;
    const base64 = capturedImage.split(',')[1];
    processImage(base64);
  };

  const handleConfirmAttendance = async () => {
    if (!ctId) return;

    const matchedStudents = recognizedFaces.filter(f => f.matched);
    
    const attendanceId = await recordAttendance(
      ctId,
      selectedClass || undefined,
      matchedStudents,
      unrecognizedCount, // visitors placeholder
      0, // experimental
      capturedImage || undefined
    );

    if (attendanceId) {
      setStep('confirm');
    }
  };

  const resetFlow = () => {
    setStep('select');
    setSelectedClass('');
    setCaptureMode(null);
    setCapturedImage(null);
    setRecognizedFaces([]);
    setUnrecognizedCount(0);
    stopCamera();
  };

  const renderSelectStep = () => (
    <div className="space-y-6">
      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione a Turma (opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma turma..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem turma específica</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.time_start && cls.time_end ? `- ${cls.time_start} às ${cls.time_end}` : cls.schedule ? `- ${cls.schedule}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Capture Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
          onClick={() => {
            setCaptureMode('camera');
            startCamera();
          }}
        >
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Tirar Foto</h3>
            <p className="text-sm text-muted-foreground">
              Use a câmera para capturar uma foto da turma
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
          onClick={() => {
            setCaptureMode('upload');
            fileInputRef.current?.click();
          }}
        >
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Enviar Foto</h3>
            <p className="text-sm text-muted-foreground">
              Faça upload de uma foto existente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Camera Preview */}
      {isCameraActive && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={stopCamera}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleCaptureAndProcess} className="gap-2">
                <Camera className="h-4 w-4" />
                Capturar e Analisar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Preview */}
      {capturedImage && captureMode === 'upload' && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
              <img
                src={capturedImage}
                alt="Foto enviada"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setCapturedImage(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleUploadAndProcess} className="gap-2">
                <Users className="h-4 w-4" />
                Analisar Foto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

  const renderProcessingStep = () => (
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

  const renderResultsStep = () => {
    const matchedFaces = recognizedFaces.filter(f => f.matched);
    const lowConfidenceFaces = recognizedFaces.filter(f => !f.matched);

    return (
      <div className="space-y-6">
        {/* Captured Image */}
        {capturedImage && (
          <Card>
            <CardHeader>
              <CardTitle>Foto Analisada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Foto analisada"
                  className="w-full h-full object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recognized Faces */}
        {matchedFaces.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Alunos Reconhecidos ({matchedFaces.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {matchedFaces.map((face, index) => (
                  <div 
                    key={face.student_id || index} 
                    className="text-center p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                  >
                    {face.photo_url && (
                      <img 
                        src={face.photo_url} 
                        alt={face.student_name}
                        className="w-16 h-16 mx-auto rounded-full object-cover mb-2"
                      />
                    )}
                    <p className="font-medium text-sm truncate">{face.student_name}</p>
                    {face.belt && (
                      <p className="text-xs text-muted-foreground capitalize">{face.belt}</p>
                    )}
                    <Badge className="mt-2 bg-green-500/10 text-green-600 text-xs">
                      {face.confidence}% confiança
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Low Confidence Faces */}
        {lowConfidenceFaces.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                Baixa Confiança ({lowConfidenceFaces.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lowConfidenceFaces.map((face, index) => (
                  <div 
                    key={face.student_id || index} 
                    className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                  >
                    <p className="font-medium text-sm">{face.student_name}</p>
                    <Badge variant="outline" className="mt-2 text-yellow-600 text-xs">
                      {face.confidence}% confiança
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unknown Faces */}
        {unrecognizedCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-5 w-5" />
                Rostos Não Identificados ({unrecognizedCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Foram detectados {unrecognizedCount} rosto(s) que não correspondem a nenhum aluno cadastrado.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline">
                  Marcar como Visitante
                </Button>
                <Button size="sm" variant="outline">
                  Marcar como Experimental
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No matches at all */}
        {matchedFaces.length === 0 && lowConfidenceFaces.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h3 className="font-semibold mb-2">Nenhum aluno reconhecido</h3>
              <p className="text-sm text-muted-foreground">
                Não foi possível identificar nenhum aluno cadastrado na foto.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={resetFlow}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Nova Captura
          </Button>
          {matchedFaces.length > 0 && (
            <Button 
              onClick={handleConfirmAttendance} 
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Confirmar Presenças ({matchedFaces.length})
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderConfirmStep = () => {
    const matchedCount = recognizedFaces.filter(f => f.matched).length;

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
              <p className="text-2xl font-bold text-green-500">{matchedCount}</p>
              <p className="text-xs text-muted-foreground">Presentes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{unrecognizedCount}</p>
              <p className="text-xs text-muted-foreground">Visitantes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{matchedCount + unrecognizedCount}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          <Button onClick={resetFlow}>
            Finalizar
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registrar Presença</h1>
        <p className="text-muted-foreground">Use o reconhecimento facial para registrar presenças automaticamente</p>
      </div>

      {step === 'select' && renderSelectStep()}
      {step === 'processing' && renderProcessingStep()}
      {step === 'results' && renderResultsStep()}
      {step === 'confirm' && renderConfirmStep()}
    </div>
  );
};

export default Presenca;
